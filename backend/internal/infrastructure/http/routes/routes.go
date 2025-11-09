package routes

import (
	"dev-compass/internal/infrastructure/http/handlers/catalog"
	"dev-compass/internal/infrastructure/http/handlers/environments"
	"dev-compass/internal/infrastructure/http/handlers/techdocs"
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the application's HTTP routes.
func SetupRoutes(router *gin.Engine, catalogHandler *catalog.Handler, techdocsHandler *techdocs.Handler, environmentHandler *environments.Handler) {
	api := router.Group("/api/v1")
	{
		api.GET("/entities", catalogHandler.GetAllEntities)
		api.GET("/entities/:kind/:namespace/:name/docs/*path", techdocsHandler.GetDoc) // Corrected method name
		api.GET("/environments", environmentHandler.GetEnvironments)
		api.GET("/components/:componentName/environments", environmentHandler.GetEnvironmentsByComponent)
	}
}
