export interface Link {
  url: string;
  title?: string;
  icon?: string;
  type?: string;
}

export interface EntityMetadata {
  name: string;
  description?: string;
  tags?: string[];
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  links?: Link[];
}

// --- Specs for different kinds ---

export interface ComponentSpec {
  type: string;
  lifecycle: string;
  owner: string;
  system?: string;
  relations?: Relation[];
  techdocs?: TechDocsSpec;
  ci?: CISpec;
  repository?: RepositorySpec;
  readmeContent?: string;
  baseImage?: string;
  ciStages?: string[];
  deploymentTarget?: string;
  environmentVariables?: { [key: string]: string };
  parameterStorePaths?: string[];
  projectURL?: string;
}

export interface ResourceSpec {
  type: string;
  owner: string;
}

// --- Generic Entity ---

export interface Entity {
  apiVersion: string;
  kind: string;
  metadata: EntityMetadata;
  spec: ComponentSpec | ResourceSpec;
}

// --- Type Guards ---

export function isComponent(entity: Entity): entity is Entity & { spec: ComponentSpec } {
  return entity.kind === 'Component';
}

export function isResource(entity: Entity): entity is Entity & { spec: ResourceSpec } {
  return entity.kind === 'Resource';
}

// --- Supporting types ---

export interface RepositorySpec {
  tags: TagSpec[];
}

export interface TagSpec {
  name: string;
  timestamp: string; // ISO date string
}

export interface CISpec {
  last_run_status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'warning';
  pipeline_url: string;
}

export interface TechDocsSpec {
  dir: string;
}

export interface Relation {
  type: string;
  target: RelationTarget;
}

export interface RelationTarget {
  kind: string;
  name: string;
  namespace?: string;
}