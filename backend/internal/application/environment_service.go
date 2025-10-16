package application

import (
	"dev-compass/internal/domain/entities"
	"dev-compass/internal/domain/ports"
	"encoding/json"
	"log"
)

// Environment represents the data structure for the environments dashboard.
type Environment struct {
	Name        string                `json:"name"`
	Description string                `json:"description,omitempty"`
	Deployments []DeploymentComponent `json:"deployments"`
}

// DeploymentComponent represents a component deployed to an environment.
type DeploymentComponent struct {
	ComponentName string `json:"componentName"`
	Version       string `json:"version"`
	Timestamp     string `json:"timestamp"`
	Entidad       string `json:"entidad,omitempty"`
	ProjectURL    string `json:"projectURL,omitempty"`
}

// EnvironmentService provides services related to environment deployments.
type EnvironmentService struct {
	repo ports.EntityRepository
}

// NewEnvironmentService creates a new EnvironmentService.
func NewEnvironmentService(repo ports.EntityRepository) *EnvironmentService {
	return &EnvironmentService{repo: repo}
}

// GetEnvironments aggregates deployment data from all components and groups it by environment.
func (s *EnvironmentService) GetEnvironments() ([]Environment, error) {
	// Define the environments and their mapping from long name to short name
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

	// Fetch all entities from the database
	allEntities, err := s.repo.FindAll("", "") // No filters needed
	log.Printf("DEBUG: Environment service fetched %d total entities from the database.", len(allEntities))
	if err != nil {
		return nil, err
	}

	// Process entities to build the environment dashboard data
	environmentMap := make(map[string][]DeploymentComponent)

	for _, entity := range allEntities {
		var spec entities.ComponentSpec
		if err := json.Unmarshal(entity.Spec, &spec); err != nil {
			continue // Skip entities with invalid spec
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

	// Assemble the final slice of environments in the correct order
	var result []Environment
	for _, envDef := range envDefinitions {
		deployments := environmentMap[envDef.LongName]
		if deployments == nil {
			deployments = []DeploymentComponent{} // Ensure the deployments array is not null
		}
		result = append(result, Environment{
			Name:        envDef.ShortName, // Use the short name for the frontend
			Description: envDef.Description,
			Deployments: deployments,
		})
	}

	// Log the final data structure for debugging
	jsonData, _ := json.Marshal(result)
	log.Printf("DEBUG: Final data being sent to frontend: %s", string(jsonData))

	return result, nil
}
