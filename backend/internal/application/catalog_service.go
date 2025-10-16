package application

import (
	"dev-compass/internal/domain/entities"
	"dev-compass/internal/domain/ports"
)

// CatalogService provides entity-related services.
type CatalogService struct {
	repo ports.EntityRepository
}

// NewCatalogService creates a new CatalogService.
func NewCatalogService(repo ports.EntityRepository) *CatalogService {
	return &CatalogService{repo: repo}
}

// GetAllEntities returns all entities from the repository.
func (s *CatalogService) GetAllEntities(search, tag string) ([]entities.Entity, error) {
	return s.repo.FindAll(search, tag)
}
