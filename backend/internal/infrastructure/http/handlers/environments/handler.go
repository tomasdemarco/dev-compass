package environments

import (
	"dev-compass/internal/application"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// Handler handles HTTP requests for environments.
type Handler struct {
	service *application.EnvironmentService
}

// NewHandler creates a new environments handler.
func NewHandler(service *application.EnvironmentService) *Handler {
	return &Handler{service: service}
}

// GetEnvironments handles the request to get environment data with optional filtering and pagination.
func (h *Handler) GetEnvironments(c *gin.Context) {
	// Parse query parameters
	search := c.DefaultQuery("search", "")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	// Ensure page and limit are positive
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	environments, err := h.service.GetEnvironments(search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, environments)
}

// GetEnvironmentsByComponent handles the request to get environment data for a specific component.
func (h *Handler) GetEnvironmentsByComponent(c *gin.Context) {
	componentName := c.Param("componentName")

	environments, err := h.service.GetEnvironmentsByComponent(componentName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, environments)
}
