package entities

import "gorm.io/datatypes"

// Entity represents a catalog entity, which can be a Component, Resource, etc.
type Entity struct {
	APIVersion string         `json:"apiVersion" gorm:"-"`
	Kind       string         `json:"kind" gorm:"index"` // Now stored in DB
	Metadata   Metadata       `json:"metadata" gorm:"embedded;embeddedPrefix:metadata_"`
	Spec       datatypes.JSON `json:"spec" gorm:"type:jsonb"` // Generic spec
}

// Metadata contains the metadata for a component.
type Metadata struct {
	Name        string                    `json:"name" gorm:"primaryKey"`
	Description string                    `json:"description,omitempty"`
	Tags        datatypes.JSON            `json:"tags,omitempty" gorm:"type:jsonb"`
	Labels      datatypes.JSONMap         `json:"labels,omitempty" gorm:"type:jsonb"`
	Annotations datatypes.JSONMap         `json:"annotations,omitempty" gorm:"type:jsonb"`
	Links       datatypes.JSONSlice[Link] `json:"links,omitempty" gorm:"type:jsonb"`
}

// Link defines a link to an external resource.
type Link struct {
	URL   string `json:"url" yaml:"url"`
	Title string `json:"title,omitempty" yaml:"title,omitempty"`
	Icon  string `json:"icon,omitempty" yaml:"icon,omitempty"`
	Type  string `json:"type,omitempty" yaml:"type,omitempty"`
}

// ComponentSpec defines the specification of a component.
type ComponentSpec struct {
	Type                 string         `json:"type"`
	Lifecycle            string         `json:"lifecycle"`
	Owner                string         `json:"owner"`
	System               string         `json:"system,omitempty"`
	Relations            datatypes.JSON `json:"relations,omitempty"`
	Deployments          []Deployment   `json:"deployments,omitempty"` // Added this line
	TechDocs             TechDocsSpec   `json:"techdocs,omitempty"`
	CI                   CISpec         `json:"ci,omitempty"`
	Repository           RepositorySpec `json:"repository,omitempty"`
	ReadmeContent        string         `json:"readmeContent,omitempty"`
	BaseImage            string         `json:"baseImage,omitempty"`
	CiStages             datatypes.JSON `json:"ciStages,omitempty"`
	DeploymentTarget     string         `json:"deploymentTarget,omitempty"`
	EnvironmentVariables datatypes.JSON `json:"environmentVariables,omitempty"`
	ParameterStorePaths  datatypes.JSON `json:"parameterStorePaths,omitempty"`
	ProjectURL           string         `json:"projectURL,omitempty"`
}

// ResourceSpec defines the specification of a resource.
type ResourceSpec struct {
	Type  string `json:"type" yaml:"type"`
	Owner string `json:"owner" yaml:"owner"`
}

// RepositorySpec defines repository-related information.
type RepositorySpec struct {
	Tags datatypes.JSON `json:"tags" gorm:"type:jsonb"`
}

// CISpec defines the CI/CD information for a component.
type CISpec struct {
	LastRunStatus string `json:"last_run_status"`
	PipelineURL   string `json:"pipeline_url"`
}

// TechDocsSpec defines the location of the documentation.
type TechDocsSpec struct {
	Dir string `json:"dir"`
}

// Relation defines a relationship to another entity.
type Relation struct {
	Type   string         `json:"type" yaml:"type"`
	Target RelationTarget `json:"target" yaml:"target"`
}

// RelationTarget defines the target of a relationship.
type RelationTarget struct {
	Kind      string `json:"kind" yaml:"kind"`
	Name      string `json:"name" yaml:"name"`
	Namespace string `json:"namespace,omitempty" yaml:"namespace,omitempty"`
}

// Deployment holds information about a single deployment of a component to an environment.
type Deployment struct {
	Environment string `json:"environment"`
	Version     string `json:"version"`
	Timestamp   string `json:"timestamp"`
	Entidad     string `json:"entidad,omitempty"`
}
