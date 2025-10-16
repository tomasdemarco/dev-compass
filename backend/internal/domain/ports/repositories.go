package ports

import "dev-compass/internal/domain/entities"

// EntityRepository defines the interface for entity data storage.
type EntityRepository interface {
	FindAll(search, tag string) ([]entities.Entity, error)
	Save(entity *entities.Entity) error
	DeleteAll() error
}
