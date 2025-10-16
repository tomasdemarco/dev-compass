package techdocs

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"path/filepath"
)

// Handler handles HTTP requests for TechDocs.
type Handler struct{}

// NewHandler creates a new TechDocs handler.
func NewHandler() *Handler {
	return &Handler{}
}

// GetDoc handles the request to get a documentation file.
func (h *Handler) GetDoc(c *gin.Context) {
	componentName := c.Param("name")
	docPath := c.Param("path")

	// Basic security check to prevent directory traversal
	if docPath == "" || docPath[0] == '.' {
		c.String(http.StatusBadRequest, "Invalid path.")
		return
	}

	// In a real implementation, you would first look up the component
	// in the database to find its configured docs directory.
	// For this mock, we assume the docs dir is always "docs".
	assumedDocsDir := "docs"

	// Construct the path to the mock file
	// Example: mocks/mock_repos/auth-service/docs/index.md
	fullPath := filepath.Join("mocks", "mock_repos", componentName, assumedDocsDir, docPath)

	content, err := os.ReadFile(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			c.String(http.StatusNotFound, "Documentation file not found.")
		} else {
			c.String(http.StatusInternalServerError, fmt.Sprintf("Error reading file: %v", err))
		}
		return
	}

	c.Data(http.StatusOK, "text/markdown; charset=utf-8", content)
}
