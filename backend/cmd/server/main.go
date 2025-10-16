package main

import (
	"context"
	"dev-compass/internal/application"
	"dev-compass/internal/domain/entities"
	"dev-compass/internal/infrastructure/config"
	"dev-compass/internal/infrastructure/http/handlers/catalog"
	"dev-compass/internal/infrastructure/http/handlers/environments"
	"dev-compass/internal/infrastructure/http/handlers/techdocs"
	"dev-compass/internal/infrastructure/http/middlewares"
	"dev-compass/internal/infrastructure/http/routes"
	"dev-compass/internal/infrastructure/persistence/postgres"
	"flag"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
)

func main() {
	// --- Command-line flag for seeding ---
	seed := flag.Bool("seed", true, "Set to true to seed the database with mock data")
	flag.Parse()

	// --- Database Connection ---
	log.Println("INFO: Initializing database connection...")
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	cfg := config.Load()

	conn, err := postgres.ConnectDB(cfg)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	log.Println("INFO: Running database migrations...")
	if err := conn.AutoMigrate(&entities.Entity{}); err != nil {
		log.Fatalf("FATAL: Failed to run database migrations: %v", err)
	}

	// --- Repository Initialization ---
	entityRepo := postgres.NewEntityRepository(conn)

	// --- Data Ingestion (conditional) ---
	if *seed {
		log.Println("INFO: --seed flag detected. Starting GitLab discovery...")
		discoverySvc, err := application.NewDiscoveryService(cfg, entityRepo)
		if err != nil {
			log.Fatalf("FATAL: Failed to create Discovery Service: %v", err)
		}
		if err := discoverySvc.RunDiscovery(context.Background()); err != nil {
			log.Fatalf("FATAL: GitLab discovery process failed: %v", err)
		}
	}

	// --- Service & Handler Initialization ---
	catalogSvc := application.NewCatalogService(entityRepo)
	environmentSvc := application.NewEnvironmentService(entityRepo)
	catalogHandler := catalog.NewHandler(catalogSvc)
	environmentHandler := environments.NewHandler(environmentSvc)
	techdocsHandler := techdocs.NewHandler()

	// --- Router Setup ---
	gin.SetMode(cfg.App.GinMode)
	router := gin.New()

	router.Use(middlewares.Cors())
	routes.SetupRoutes(router, catalogHandler, techdocsHandler, environmentHandler)

	// --- Server Start ---
	log.Println("INFO: Server is starting on port 8080...")
	if err := router.Run(fmt.Sprintf(":%d", +cfg.App.Port)); err != nil {
		log.Fatalf("FATAL: Failed to start server: %v", err)
	}
}
