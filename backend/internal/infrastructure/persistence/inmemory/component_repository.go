package inmemory

//
//import (
//	"dev-compass/internal/domain/entities"
//	"encoding/json"
//	"os"
//	"strings"
//)
//
//// EntityRepository is an in-memory implementation of the entity repository.
//type EntityRepository struct {
//	entities []entities.Entity
//}
//
//// NewEntityRepository creates a new in-memory entity repository.
//func NewEntityRepository(mockFilePath string) (*EntityRepository, error) {
//	if mockFilePath == "" {
//		return &EntityRepository{entities: make([]entities.Entity, 0)}, nil
//	}
//	data, err := os.ReadFile(mockFilePath)
//	if err != nil {
//		return nil, err
//	}
//
//	var entities []entities.Entity
//	if err := json.Unmarshal(data, &entities); err != nil {
//		return nil, err
//	}
//
//	return &EntityRepository{entities: entities}, nil
//}
//
//// FindAll returns all entities from the in-memory store, with optional filtering.
//func (r *EntityRepository) FindAll(search, tag string) ([]entities.Entity, error) {
//	var filtered []entities.Entity
//
//	searchLower := strings.ToLower(search)
//
//	for _, e := range r.entities {
//		// Tag filtering
//		if tag != "" {
//			foundTag := false
//			var tags []string
//			if err := json.Unmarshal(e.Metadata.Tags, &tags); err == nil {
//				for _, t := range tags {
//					if t == tag {
//						foundTag = true
//						break
//					}
//				}
//			}
//			if !foundTag {
//				continue // Skip if tag doesn't match
//			}
//		}
//
//		// Search filtering
//		if searchLower != "" {
//			if !strings.Contains(strings.ToLower(e.Metadata.Name), searchLower) &&
//				!strings.Contains(strings.ToLower(e.Metadata.Description), searchLower) {
//				continue // Skip if search doesn't match name or description
//			}
//		}
//
//		filtered = append(filtered, e)
//	}
//
//	return filtered, nil
//}
//
//// Save adds an entity to the in-memory store.
//func (r *EntityRepository) Save(entity *entities.Entity) error {
//	r.entities = append(r.entities, *entity)
//	return nil
//}
//
//// DeleteAll removes all records from the in-memory store.
//func (r *EntityRepository) DeleteAll() error {
//	r.entities = make([]entities.Entity, 0)
//	return nil
//}
