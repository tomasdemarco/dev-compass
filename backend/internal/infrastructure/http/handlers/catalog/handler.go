package catalog

import (
	"dev-compass/internal/application"
	"github.com/gin-gonic/gin"
	"net/http"
)

// Handler handles HTTP requests for the catalog.
type Handler struct {
	service *application.CatalogService
}

// NewHandler creates a new catalog handler.
func NewHandler(service *application.CatalogService) *Handler {
	return &Handler{service: service}
}

// GetAllEntities handles the request to get all entities.
func (h *Handler) GetAllEntities(c *gin.Context) {
	search := c.Query("search")
	tag := c.Query("tag")

	entities, err := h.service.GetAllEntities(search, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entities)
}
