package environments

import (
	"dev-compass/internal/application"
	"github.com/gin-gonic/gin"
	"net/http"
)

// Handler handles HTTP requests for environments.
type Handler struct {
	service *application.EnvironmentService
}

// NewHandler creates a new environments handler.
func NewHandler(service *application.EnvironmentService) *Handler {
	return &Handler{service: service}
}

// GetEnvironments handles the request to get all environment data.
func (h *Handler) GetEnvironments(c *gin.Context) {
	environments, err := h.service.GetEnvironments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, environments)
}
