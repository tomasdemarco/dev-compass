package postgres

import (
	"dev-compass/internal/domain/entities"
	"gorm.io/gorm"
)

// EntityRepository is a GORM implementation of the entity repository.
type EntityRepository struct {
	db *gorm.DB
}

// NewEntityRepository creates a new GORM entity repository.
func NewEntityRepository(db *gorm.DB) *EntityRepository {
	return &EntityRepository{db: db}
}

// FindAll retrieves all entities, with optional filtering.
func (r *EntityRepository) FindAll(search, tag string) ([]entities.Entity, error) {
	var entityList []entities.Entity
	tx := r.db.Model(&entities.Entity{})

	if search != "" {
		searchTerm := "%" + search + "%"
		tx = tx.Where(`metadata_name ILIKE ? OR metadata_description ILIKE ?`, searchTerm, searchTerm)
	}
	if tag != "" {
		// Implement tag logic for postgres
	}

	if err := tx.Find(&entityList).Error; err != nil {
		return nil, err
	}
	return entityList, nil
}

// Save creates or updates an entity in the database.
func (r *EntityRepository) Save(entity *entities.Entity) error {
	return r.db.Create(entity).Error
}

// DeleteAll removes all records from the entities table.
func (r *EntityRepository) DeleteAll() error {
	return r.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&entities.Entity{}).Error
}
