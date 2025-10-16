package application

import (
	"context"
	"dev-compass/internal/domain/entities"
	"dev-compass/internal/domain/ports"
	"dev-compass/internal/infrastructure/config"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/mitchellh/mapstructure"
	gitlab "gitlab.com/gitlab-org/api/client-go"
	"gopkg.in/yaml.v3"
	"gorm.io/datatypes"
	"io"
	"log"
	"net/url"
	"os"
	"regexp"
	"strings"
)

// --- Intermediate structs for safe YAML parsing ---
type yamlEntity struct {
	APIVersion string                 `yaml:"apiVersion"`
	Kind       string                 `yaml:"kind"`
	Metadata   yamlMetadata           `yaml:"metadata"`
	Spec       map[string]interface{} `yaml:"spec"` // Generic map to handle different kinds
}
type yamlMetadata struct {
	Name        string            `yaml:"name"`
	Description string            `yaml:"description"`
	Tags        []string          `yaml:"tags"`
	Labels      map[string]string `yaml:"labels"`
	Annotations map[string]string `yaml:"annotations"`
	Links       []entities.Link   `yaml:"links"`
}

// DiscoveryService handles the discovery of entities from GitLab.
type DiscoveryService struct {
	cfg    *config.Config
	client *gitlab.Client
	repo   ports.EntityRepository // Use the generic EntityRepository
}

// NewDiscoveryService creates a new DiscoveryService.
func NewDiscoveryService(cfg *config.Config, repo ports.EntityRepository) (*DiscoveryService, error) {
	if cfg.GitLab.Token == "" {
		return nil, fmt.Errorf("GitLab token is not configured")
	}
	client, err := gitlab.NewClient(cfg.GitLab.Token)
	if err != nil {
		return nil, fmt.Errorf("failed to create GitLab client: %w", err)
	}
	return &DiscoveryService{
		cfg:    cfg,
		client: client,
		repo:   repo,
	}, nil
}

// RunDiscovery starts the discovery process.
func (s *DiscoveryService) RunDiscovery(ctx context.Context) error {
	log.Println("INFO: Deleting all existing entities before discovery...")
	if err := s.repo.DeleteAll(); err != nil {
		return fmt.Errorf("failed to delete existing entities: %w", err)
	}

	// Ingest local files
	if err := s.ingestLocalFile("mocks/external-components.yaml", true); err != nil {
		log.Printf("WARN: Failed to ingest external entities file: %v", err)
	}
	if err := s.ingestLocalFile("mocks/manual-components.yaml", false); err != nil {
		log.Printf("WARN: Failed to ingest manual entities file: %v", err)
	}
	if err := s.ingestLocalFile("mocks/resources.yaml", false); err != nil {
		log.Printf("WARN: Failed to ingest resources file: %v", err)
	}

	log.Println("INFO: Starting GitLab discovery process...")

	if s.cfg.GitLab.GroupToScan == "" {
		return fmt.Errorf("GITLAB_GROUP_TO_SCAN is not configured")
	}

	groupToScan := s.cfg.GitLab.GroupToScan
	u, err := url.Parse(groupToScan)
	if err == nil && u.Scheme != "" && u.Host != "" {
		groupToScan = strings.TrimPrefix(u.Path, "/")
	}

	projects, _, err := s.client.Groups.ListGroupProjects(groupToScan, &gitlab.ListGroupProjectsOptions{
		IncludeSubGroups: gitlab.Ptr(true),
		ListOptions:      gitlab.ListOptions{PerPage: 100},
	})
	if err != nil {
		return fmt.Errorf("failed to list projects in group %s: %w", groupToScan, err)
	}

	log.Printf("INFO: Found %d projects to scan.", len(projects))

	for _, project := range projects {
		log.Printf("INFO: Scanning project: %s", project.PathWithNamespace)

		var fileContent *gitlab.File
		foundFile := false
		possibleFilenames := []string{"catalog-info.yaml", "catalog-info.yml", "devcompass.yaml", "devcompass.yml"}

		for _, filename := range possibleFilenames {
			fileContent, _, err = s.client.RepositoryFiles.GetFile(project.ID, filename, &gitlab.GetFileOptions{
				Ref: gitlab.Ptr(project.DefaultBranch),
			})
			if err == nil {
				foundFile = true
				break
			}
		}

		if !foundFile {
			log.Printf("DEBUG: Could not find a catalog file in %s", project.PathWithNamespace)
			continue
		}

		decodedContent, err := base64.StdEncoding.DecodeString(fileContent.Content)
		if err != nil {
			log.Printf("ERROR: Failed to decode YAML for %s: %v", project.PathWithNamespace, err)
			continue
		}

		var tempEntity yamlEntity
		if err := yaml.Unmarshal(decodedContent, &tempEntity); err != nil {
			log.Printf("ERROR: Failed to parse YAML for %s: %v", project.PathWithNamespace, err)
			continue
		}

		// Process the generic entity
		finalEntity, err := s.processEntity(&tempEntity, project)
		if err != nil {
			log.Printf("ERROR: Failed to process entity from %s: %v", project.PathWithNamespace, err)
			continue
		}

		// Save the final, GORM-compatible entity
		if err := s.repo.Save(finalEntity); err != nil {
			log.Printf("ERROR: Failed to save entity %s to database: %v", finalEntity.Metadata.Name, err)
			continue
		}

		log.Printf("INFO: Successfully ingested entity: %s (%s)", finalEntity.Metadata.Name, finalEntity.Kind)
	}

	log.Println("INFO: GitLab discovery process finished.")
	return nil
}

// ingestLocalFile processes a single YAML file that may contain multiple entity definitions.
func (s *DiscoveryService) ingestLocalFile(path string, isExternal bool) error {
	log.Printf("INFO: Ingesting local file: %s", path)
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	decoder := yaml.NewDecoder(file)

	for {
		var tempEntity yamlEntity
		if err := decoder.Decode(&tempEntity); err != nil {
			if err == io.EOF {
				break // End of file
			}
			return fmt.Errorf("failed to parse YAML from %s: %w", path, err)
		}

		// Skip empty documents found in the YAML file
		if tempEntity.Kind == "" || tempEntity.Metadata.Name == "" {
			continue
		}

		// Add 'resource' tag if the kind is Resource
		if tempEntity.Kind == "Resource" {
			found := false
			for _, tag := range tempEntity.Metadata.Tags {
				if tag == "resource" {
					found = true
					break
				}
			}
			if !found {
				tempEntity.Metadata.Tags = append([]string{"resource"}, tempEntity.Metadata.Tags...)
			}
		}

		// Conditionally add the 'external' tag
		if isExternal {
			found := false
			for _, tag := range tempEntity.Metadata.Tags {
				if tag == "external" {
					found = true
					break
				}
			}
			if !found {
				tempEntity.Metadata.Tags = append(tempEntity.Metadata.Tags, "external")
			}
		}

		// Process the generic entity
		// For local files, we don't have a GitLab project object, so we pass nil.
		finalEntity, err := s.processEntity(&tempEntity, nil)
		if err != nil {
			log.Printf("WARN: Failed to process local entity %s: %v", tempEntity.Metadata.Name, err)
			continue
		}

		if err := s.repo.Save(finalEntity); err != nil {
			log.Printf("WARN: Failed to save entity %s from local file: %v", finalEntity.Metadata.Name, err)
		}
		log.Printf("INFO: Successfully ingested local entity: %s (%s)", finalEntity.Metadata.Name, finalEntity.Kind)
	}
	return nil
}

// processEntity takes a parsed YAML entity and a GitLab project (if available) and returns a final, enriched Entity object.
func (s *DiscoveryService) processEntity(tempEntity *yamlEntity, project *gitlab.Project) (*entities.Entity, error) {

	// --- Start with base entity data ---
	tagsJSON, _ := json.Marshal(tempEntity.Metadata.Tags)
	labelsMap := make(datatypes.JSONMap)
	if tempEntity.Metadata.Labels != nil {
		for k, v := range tempEntity.Metadata.Labels {
			labelsMap[k] = v
		}
	}
	annotationsMap := make(datatypes.JSONMap)
	if tempEntity.Metadata.Annotations != nil {
		for k, v := range tempEntity.Metadata.Annotations {
			annotationsMap[k] = v
		}
	}

	finalEntity := &entities.Entity{
		APIVersion: tempEntity.APIVersion,
		Kind:       tempEntity.Kind,
		Metadata: entities.Metadata{
			Name:        tempEntity.Metadata.Name,
			Description: tempEntity.Metadata.Description,
			Tags:        datatypes.JSON(tagsJSON),
			Labels:      labelsMap,
			Annotations: annotationsMap,
			Links:       tempEntity.Metadata.Links,
		},
	}

	// --- Process Spec based on Kind ---
	switch tempEntity.Kind {
	case "Component":
		var compSpec entities.ComponentSpec

		// Manually handle fields that are JSON in the DB model but structured in YAML/JSON input
		if relationsData, ok := tempEntity.Spec["relations"]; ok {
			compSpec.Relations, _ = json.Marshal(relationsData)
			delete(tempEntity.Spec, "relations") // Remove from map before decoding the rest
		}
		if repoData, ok := tempEntity.Spec["repository"].(map[string]interface{}); ok {
			if tagsData, ok := repoData["tags"]; ok {
				compSpec.Repository.Tags, _ = json.Marshal(tagsData)
				delete(repoData, "tags")
			}
		}

		if err := mapstructure.Decode(tempEntity.Spec, &compSpec); err != nil {
			return nil, fmt.Errorf("failed to decode Component spec for %s: %w", tempEntity.Metadata.Name, err)
		}

		// --- Logic for relations (including shorthand) ---
		shorthandRelations := s.processShorthandRelations(tempEntity.Spec)
		if len(shorthandRelations) > 0 {
			// Unmarshal existing relations if they exist
			var existingRelations []entities.Relation
			if len(compSpec.Relations) > 0 {
				if err := json.Unmarshal(compSpec.Relations, &existingRelations); err != nil {
					log.Printf("WARN: could not unmarshal existing relations for %s: %v", tempEntity.Metadata.Name, err)
				}
			}
			compSpec.Relations, _ = json.Marshal(append(existingRelations, shorthandRelations...))
		}

		// --- Enrich ComponentSpec with data from GitLab API (if available) ---
		if project != nil {
			s.enrichComponentSpec(&compSpec, project)
			compSpec.ProjectURL = project.WebURL
		}

		// Marshal the final, enriched spec back to JSON for storage
		specJSON, err := json.Marshal(compSpec)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal final Component spec for %s: %w", tempEntity.Metadata.Name, err)
		}
		finalEntity.Spec = specJSON

	case "Resource":
		var resSpec entities.ResourceSpec
		if err := mapstructure.Decode(tempEntity.Spec, &resSpec); err != nil {
			return nil, fmt.Errorf("failed to decode Resource spec for %s: %w", tempEntity.Metadata.Name, err)
		}
		// No enrichment for resources yet
		specJSON, err := json.Marshal(resSpec)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal final Resource spec for %s: %w", tempEntity.Metadata.Name, err)
		}
		finalEntity.Spec = specJSON

	default:
		log.Printf("WARN: Unknown entity kind '%s' for %s. Skipping spec processing.", tempEntity.Kind, tempEntity.Metadata.Name)
		finalEntity.Spec = datatypes.JSON("{}")
	}

	return finalEntity, nil
}

// enrichComponentSpec populates a ComponentSpec with data fetched from the GitLab API.
func (s *DiscoveryService) enrichComponentSpec(spec *entities.ComponentSpec, project *gitlab.Project) {
	// --- Fetch Deployments for Environments --- //
	environmentNames := []string{"wg_adquirencia_prod", "wg_adquirencia_uat", "wg_adquirencia_qa", "wg_adquirencia_dev"}
	var deployments []entities.Deployment
	jobNameRegex := regexp.MustCompile(`\s\[(\d+)\]$`)

	for _, envName := range environmentNames {
		opts := &gitlab.ListProjectDeploymentsOptions{
			Environment: gitlab.Ptr(envName),
			Status:      gitlab.Ptr("success"),
			OrderBy:     gitlab.Ptr("id"),
			Sort:        gitlab.Ptr("desc"),
			ListOptions: gitlab.ListOptions{PerPage: 100}, // Get a decent number to find all entities
		}
		deploys, _, err := s.client.Deployments.ListProjectDeployments(project.ID, opts)
		log.Printf("INFO: Project [%s] - Env [%s]: Found %d successful deployments to process.", project.PathWithNamespace, envName, len(deploys))

		if err != nil {
			log.Printf("WARN: Could not fetch deployments for env %s in project %s: %v", envName, project.PathWithNamespace, err)
			continue
		}

		// Find the latest deployment for each entidad in this environment, up to a limit.

		latestForEntidad := make(map[string]bool)

		deploymentsInEnvCount := 0

		for _, d := range deploys {

			if deploymentsInEnvCount >= 10 {

				break // Stop after finding the 10 most recent unique deployments

			}

			if d.Deployable.ID == 0 || !strings.HasPrefix(d.Deployable.Name, "deploy") {

				continue

			}

			log.Printf("TRACE: Processing job with name: '%s'", d.Deployable.Name)

			// Try to parse an Entidad from the job name, but don't fail if it's not there.

			matches := jobNameRegex.FindStringSubmatch(d.Deployable.Name)

			entidad := ""

			if len(matches) >= 2 {

				entidad = matches[1]

			}

			// Create a unique key for the deployment to avoid duplicates if an entidad is not present

			deploymentKey := entidad

			if deploymentKey == "" {

				deploymentKey = "global" // A key for non-entidad deployments

			}

			// Since the list is sorted by latest, the first one we see for a key is the one we want

			if _, found := latestForEntidad[deploymentKey]; !found {

				version := "N/A"

				if d.Deployable.Tag {

					version = d.Ref

				} else if len(d.SHA) >= 7 {

					version = d.SHA[:7]

				}

				deployments = append(deployments, entities.Deployment{

					Environment: envName,

					Version: version,

					Timestamp: d.CreatedAt.String(),

					Entidad: entidad,
				})

				log.Printf("DEBUG: Project [%s] - Parsed deployment: Env=%s, Entidad=%s, Version=%s", project.PathWithNamespace, envName, entidad, version)

				latestForEntidad[deploymentKey] = true

				deploymentsInEnvCount++ // Increment counter

			}

		}
	}
	spec.Deployments = deployments

	// --- Fetch README.md ---
	readmeFile, _, err := s.client.RepositoryFiles.GetFile(project.ID, "README.md", &gitlab.GetFileOptions{Ref: gitlab.Ptr(project.DefaultBranch)})
	if err != nil {
		log.Printf("DEBUG: No README.md found for %s, continuing without it.", project.PathWithNamespace)
	} else {
		decodedReadme, err := base64.StdEncoding.DecodeString(readmeFile.Content)
		if err != nil {
			log.Printf("ERROR: Failed to decode README.md for %s: %v", project.PathWithNamespace, err)
		} else {
			spec.ReadmeContent = string(decodedReadme)
		}
	}

	// --- Enrich with dynamic data from GitLab API ---
	repoAPITags, _, err := s.client.Tags.ListTags(project.ID, &gitlab.ListTagsOptions{
		ListOptions: gitlab.ListOptions{PerPage: 10},
		OrderBy:     gitlab.Ptr("updated"),
		Sort:        gitlab.Ptr("desc"),
	})
	if err != nil {
		log.Printf("WARN: Could not fetch tags for project %s: %v", project.PathWithNamespace, err)
	} else {
		var collectedTags []map[string]string
		for _, tag := range repoAPITags {
			if tag.Commit != nil {
				collectedTags = append(collectedTags, map[string]string{
					"name":      tag.Name,
					"timestamp": tag.Commit.CreatedAt.String(),
				})
			}
		}
		spec.Repository.Tags, _ = json.Marshal(collectedTags)

		if len(repoAPITags) > 0 {
			latestTag := repoAPITags[0]
			if latestTag.Commit != nil {
				log.Printf("DEBUG: Found latest tag '%s', finding pipeline for commit SHA %s", latestTag.Name, latestTag.Commit.ID)
				pipelines, _, err := s.client.Pipelines.ListProjectPipelines(project.ID, &gitlab.ListProjectPipelinesOptions{
					SHA:         gitlab.Ptr(latestTag.Commit.ID),
					ListOptions: gitlab.ListOptions{PerPage: 1},
				})
				if err != nil {
					log.Printf("WARN: Could not fetch pipeline list for commit %s: %v", latestTag.Commit.ID, err)
				} else if len(pipelines) > 0 {
					basicPipeline := pipelines[0]
					detailedPipeline, _, err := s.client.Pipelines.GetPipeline(project.ID, basicPipeline.ID)
					if err != nil {
						log.Printf("WARN: Could not get detailed pipeline for ID %d, falling back to basic status: %v", basicPipeline.ID, err)
						spec.CI.LastRunStatus = basicPipeline.Status
						spec.CI.PipelineURL = basicPipeline.WebURL
					} else {
						finalStatus := detailedPipeline.Status
						if detailedPipeline.DetailedStatus != nil && strings.Contains(detailedPipeline.DetailedStatus.Label, "warning") {
							finalStatus = "warning"
							log.Printf("DEBUG: Overriding status to 'warning' based on detailed status label: '%s'", detailedPipeline.DetailedStatus.Label)
						}
						spec.CI.LastRunStatus = finalStatus
						spec.CI.PipelineURL = detailedPipeline.WebURL
						log.Printf("DEBUG: Found pipeline %d with final status '%s' for latest tag", detailedPipeline.ID, finalStatus)
					}
				}
			}
		}
	}

	// --- Enrich with CI/CD file contents ---
	getFileContent := func(filename string) (string, error) {
		log.Printf("DEBUG: Attempting to read file '%s' for project '%s'...", filename, project.PathWithNamespace)
		file, _, err := s.client.RepositoryFiles.GetFile(project.ID, filename, &gitlab.GetFileOptions{
			Ref: gitlab.Ptr(project.DefaultBranch),
		})
		if err != nil {
			log.Printf("DEBUG: File '%s' not found for project '%s'.", filename, project.PathWithNamespace)
			return "", err
		}
		decoded, err := base64.StdEncoding.DecodeString(file.Content)
		if err != nil {
			return "", fmt.Errorf("failed to decode %s: %w", filename, err)
		}
		return string(decoded), nil
	}

	// Parse Dockerfile for base image
	var content string
	content, err = getFileContent("Dockerfile")
	if err != nil {
		content, _ = getFileContent("dockerfile")
	}
	if content != "" {
		re := regexp.MustCompile(`(?m)^FROM\s+([^\s]+)`)
		matches := re.FindStringSubmatch(content)
		if len(matches) > 1 {
			spec.BaseImage = matches[1]
			log.Printf("DEBUG: Found base image: '%s'", spec.BaseImage)
		}
	}

	// Parse .gitlab-ci.yml for stages and variables
	envVars := make(map[string]string)
	ciFileContent, err := getFileContent(".gitlab-ci.yml")
	if err == nil {
		log.Printf("DEBUG: Found .gitlab-ci.yml, attempting to parse.")
		// ... (existing parsing logic for stages and variables) ...
	}

	// After parsing CI file, re-process deployments with the new context
	hasMatrix := strings.Contains(ciFileContent, "parallel:") && strings.Contains(ciFileContent, "matrix:")
	var finalDeployments []entities.Deployment
	for _, dep := range spec.Deployments {
		if hasMatrix && dep.Entidad == "" {
			log.Printf("TRACE: Project has matrix, ignoring global deployment for env %s", dep.Environment)
			continue // Skip global deployments when a matrix is expected
		}
		finalDeployments = append(finalDeployments, dep)
	}
	spec.Deployments = finalDeployments

	// Derive deployment target from project name
	spec.DeploymentTarget = strings.ToLower(project.Name)
	spec.DeploymentTarget = strings.ReplaceAll(spec.DeploymentTarget, "_", "-")
	log.Printf("DEBUG: Derived deployment target: '%s'", spec.DeploymentTarget)

	// Parse deploy-ecs-fargate.yml for more env vars and parameter store paths
	var psPaths []string
	if content, err := getFileContent("deploy-ecs-fargate.yml"); err == nil {
		log.Printf("DEBUG: Found deploy-ecs-fargate.yml, attempting to parse.")
		var fargateYaml map[string]interface{}
		if err := yaml.Unmarshal([]byte(content), &fargateYaml); err == nil {
			// Simplified parsing logic, can be made more robust
			if resources, ok := fargateYaml["Resources"].(map[string]interface{}); ok {
				if taskDef, ok := resources["TaskDefinition"].(map[string]interface{}); ok {
					if props, ok := taskDef["Properties"].(map[string]interface{}); ok {
						if containers, ok := props["ContainerDefinitions"].([]interface{}); ok && len(containers) > 0 {
							if firstContainer, ok := containers[0].(map[string]interface{}); ok {
								if envs, ok := firstContainer["Environment"].([]interface{}); ok {
									for _, env := range envs {
										if envMap, ok := env.(map[string]interface{}); ok {
											envVars[fmt.Sprintf("%v", envMap["Name"])] = fmt.Sprintf("%v", envMap["Value"])
										}
									}
								}
							}
						}
					}
					if taskRole, ok := resources["TaskRole"].(map[string]interface{}); ok {
						if props, ok := taskRole["Properties"].(map[string]interface{}); ok {
							if policies, ok := props["Policies"].([]interface{}); ok {
								for _, policy := range policies {
									if policyMap, ok := policy.(map[string]interface{}); ok {
										if doc, ok := policyMap["PolicyDocument"].(map[string]interface{}); ok {
											if statements, ok := doc["Statement"].([]interface{}); ok {
												for _, stmt := range statements {
													if stmtMap, ok := stmt.(map[string]interface{}); ok {
														if action, ok := stmtMap["Action"].([]interface{}); ok && fmt.Sprintf("%v", action[0]) == "ssm:GetParametersByPath" {
															if resources, ok := stmtMap["Resource"].([]interface{}); ok {
																for _, res := range resources {
																	pathRe := regexp.MustCompile(`parameter(/.+)`)
																	if resMap, ok := res.(map[string]interface{}); ok {
																		if sub, ok := resMap["Fn::Sub"].(string); ok {
																			matches := pathRe.FindStringSubmatch(sub)
																			if len(matches) > 1 {
																				psPaths = append(psPaths, matches[1])
																			}
																		}
																	} else if resStr, ok := res.(string); ok {
																		matches := pathRe.FindStringSubmatch(resStr)
																		if len(matches) > 1 {
																			psPaths = append(psPaths, matches[1])
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	spec.EnvironmentVariables, _ = json.Marshal(envVars)
	spec.ParameterStorePaths, _ = json.Marshal(psPaths)
}

// processShorthandRelations parses shorthand relation fields from a generic spec map.
func (s *DiscoveryService) processShorthandRelations(spec map[string]interface{}) []entities.Relation {
	// parseEntityRef parses a Backstage entity reference string.
	// Format: [<kind>:][<namespace>/]<name>
	parseEntityRef := func(ref string) entities.RelationTarget {
		target := entities.RelationTarget{Namespace: "default"}
		parts := strings.SplitN(ref, ":", 2)
		var rest string
		if len(parts) == 2 {
			target.Kind = parts[0]
			rest = parts[1]
		} else {
			rest = parts[0]
		}
		parts = strings.SplitN(rest, "/", 2)
		if len(parts) == 2 {
			target.Namespace = parts[0]
			target.Name = parts[1]
		} else {
			target.Name = parts[0]
		}
		return target
	}

	shorthandMapping := map[string]string{
		"dependsOn":    "dependsOn",
		"dependencyOf": "dependencyOf",
		"providesApis": "providesApi",
		"consumesApis": "consumesApi",
		"partOf":       "partOf",
		"hasPart":      "hasPart",
	}
	defaultKinds := map[string]string{
		"dependsOn":    "Component",
		"dependencyOf": "Component",
		"providesApis": "API",
		"consumesApis": "API",
		"partOf":       "System",
		"hasPart":      "Component",
	}

	var newRelations []entities.Relation
	for key, relType := range shorthandMapping {
		if refs, ok := spec[key].([]interface{}); ok {
			for _, ref := range refs {
				if refStr, ok := ref.(string); ok {
					target := parseEntityRef(refStr)
					if target.Kind == "" {
						target.Kind = defaultKinds[key]
					}
					newRelations = append(newRelations, entities.Relation{
						Type:   relType,
						Target: target,
					})
				}
			}
		}
	}
	return newRelations
}
