package postgres

import (
	"dev-compass/internal/infrastructure/config"
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
)

func ConnectDB(config *config.Config) (conn *gorm.DB, err error) {

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s search_path=%s",
		config.DB.Host,
		config.DB.User,
		config.DB.Password,
		config.DB.Name,
		config.DB.Port,
		config.DB.SslMode,
		config.DB.Schema,
	)

	conn, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: &gormLogger{},
	})
	if err != nil {
		log.Fatalf("Error to connect database: %s", err.Error())
	}

	// AutoMigrate crea las tablas si no existen y migra los cambios si los modelos cambian.
	//err = conn.AutoMigrate(domain.Transaction{})

	//if err != nil {
	//	log.Fatal("Error al migrar la base de datos:", err)
	//}

	return conn, err
}
