package application

import (
	"dev-compass/internal/domain/entities"
	"dev-compass/internal/domain/ports"
	"encoding/json"
	"log"
	"sort"
	"strings"
)

// --- New Response Structures ---

// DeploymentVersion holds the details of a specific version deployment.
type DeploymentVersion struct {
	Version    string `json:"version"`
	Timestamp  string `json:"timestamp"`
	Entidad    string `json:"entidad,omitempty"`
	ProjectURL string `json:"projectURL,omitempty"`
}

// GroupedComponent holds a component name and all its deployed versions.
type GroupedComponent struct {
	ComponentName string              `json:"componentName"`
	Deployments   []DeploymentVersion `json:"deployments"`
}

// PaginatedGroupedComponents holds the paginated list of grouped components and the total count.
type PaginatedGroupedComponents struct {
	Components []GroupedComponent `json:"components"`
	Total      int                `json:"total"`
}

// EnvironmentWithPagination represents an environment with paginated, grouped deployment data.
type EnvironmentWithPagination struct {
	Name        string                     `json:"name"`
	Description string                     `json:"description,omitempty"`
	Result      PaginatedGroupedComponents `json:"result"`
}

// --- Original struct for processing, not for final output ---
type DeploymentComponent struct {
	ComponentName string
	Version       string
	Timestamp     string
	Entidad       string
	ProjectURL    string
}

// EnvironmentService provides services related to environment deployments.
type EnvironmentService struct {
	repo ports.EntityRepository
}

// NewEnvironmentService creates a new EnvironmentService.
func NewEnvironmentService(repo ports.EntityRepository) *EnvironmentService {
	return &EnvironmentService{repo: repo}
}

// GetEnvironments aggregates, groups, filters, and paginates deployment data.
func (s *EnvironmentService) GetEnvironments(search string, page int, limit int) ([]EnvironmentWithPagination, error) {
	envDefinitions := []struct {
		ShortName   string
		LongName    string
		Description string
	}{
		{"production", "wg_adquirencia_prod", "Entorno productivo."},
		{"uat", "wg_adquirencia_uat", "Entorno de User Acceptance Testing."},
		{"qa", "wg_adquirencia_qa", "Entorno de Quality Assurance."},
		{"development", "wg_adquirencia_dev", "Entorno de desarrollo para nuevas funcionalidades."},
	}

	allEntities, err := s.repo.FindAll("", "") // Fetch all, filter in memory
	if err != nil {
		return nil, err
	}

	// 1. Filter entities by search term and build a map of all deployments per environment
	environmentMap := make(map[string][]DeploymentComponent)
	for _, entity := range allEntities {
		if search != "" && !strings.Contains(strings.ToLower(entity.Metadata.Name), strings.ToLower(search)) {
			continue
		}

		var spec entities.ComponentSpec
		if err := json.Unmarshal(entity.Spec, &spec); err != nil {
			continue
		}

		if spec.Deployments != nil {
			for _, dep := range spec.Deployments {
				environmentMap[dep.Environment] = append(environmentMap[dep.Environment], DeploymentComponent{
					ComponentName: entity.Metadata.Name,
					Version:       dep.Version,
					Timestamp:     dep.Timestamp,
					Entidad:       dep.Entidad,
					ProjectURL:    spec.ProjectURL,
				})
			}
		}
	}

	var result []EnvironmentWithPagination
	for _, envDef := range envDefinitions {
		deployments := environmentMap[envDef.LongName]

		// 2. Group deployments by component name for the current environment
		componentGroupMap := make(map[string][]DeploymentVersion)
		for _, dep := range deployments {
			componentGroupMap[dep.ComponentName] = append(componentGroupMap[dep.ComponentName], DeploymentVersion{
				Version:    dep.Version,
				Timestamp:  dep.Timestamp,
				Entidad:    dep.Entidad,
				ProjectURL: dep.ProjectURL,
			})
		}

		// Convert map to slice to make it sortable
		groupedComponents := make([]GroupedComponent, 0, len(componentGroupMap))
		for name, deps := range componentGroupMap {
			groupedComponents = append(groupedComponents, GroupedComponent{ComponentName: name, Deployments: deps})
		}

		// Sort grouped components by name for consistent ordering
		sort.Slice(groupedComponents, func(i, j int) bool {
			return groupedComponents[i].ComponentName < groupedComponents[j].ComponentName
		})

		// 3. Paginate the list of grouped components
		totalComponents := len(groupedComponents)
		startIndex := (page - 1) * limit
		endIndex := startIndex + limit

		if startIndex >= totalComponents {
			startIndex = totalComponents
		}
		if endIndex > totalComponents {
			endIndex = totalComponents
		}

		paginatedComponents := groupedComponents[startIndex:endIndex]

		result = append(result, EnvironmentWithPagination{
			Name:        envDef.ShortName,
			Description: envDef.Description,
			Result: PaginatedGroupedComponents{
				Components: paginatedComponents,
				Total:      totalComponents,
			},
		})
	}

	jsonData, _ := json.Marshal(result)
	log.Printf("DEBUG: Final paginated and grouped data being sent to frontend: %s", string(jsonData))

	return result, nil
}

// ComponentDeployment represents a single deployment of a component to an environment.
type ComponentDeployment struct {
	Environment string `json:"environment"`
	Version     string `json:"version"`
	Timestamp   string `json:"timestamp"`
	Entidad     string `json:"entidad,omitempty"`
}

// GetEnvironmentsByComponent finds a single component by name and returns its deployment locations.
func (s *EnvironmentService) GetEnvironmentsByComponent(componentName string) ([]ComponentDeployment, error) {
	// Since there is no FindByName, we fetch all and filter in memory.
	allEntities, err := s.repo.FindAll("", "")
	if err != nil {
		return nil, err
	}

	for _, entity := range allEntities {
		if entity.Metadata.Name == componentName {
			var spec entities.ComponentSpec
			if err := json.Unmarshal(entity.Spec, &spec); err != nil {
				// Log the error but continue, as other entities might be valid
				log.Printf("ERROR: could not unmarshal spec for entity %s: %v", entity.Metadata.Name, err)
				continue
			}

			if spec.Deployments != nil {
				deployments := make([]ComponentDeployment, len(spec.Deployments))
				for i, dep := range spec.Deployments {
					deployments[i] = ComponentDeployment{
						Environment: dep.Environment,
						Version:     dep.Version,
						Timestamp:   dep.Timestamp,
						Entidad:     dep.Entidad,
					}
				}
				return deployments, nil
			}
			// Found component but it has no deployment info
			return []ComponentDeployment{}, nil
		}
	}

	// Component not found
	return []ComponentDeployment{}, nil
}
