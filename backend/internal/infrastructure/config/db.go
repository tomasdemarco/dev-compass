package config

import (
	"log"
	"os"
)

type DB struct {
	Host,
	Port,
	Name,
	Schema,
	User,
	Password,
	SslMode string
}

func LoadDB() *DB {
	host, hostFound := os.LookupEnv("DB_HOST")
	if !hostFound {
		log.Fatal("env DB_HOST not found")
	}

	port, portFound := os.LookupEnv("DB_PORT")
	if !portFound {
		log.Fatal("env DB_PORT not found")
	}

	name, nameFound := os.LookupEnv("DB_NAME")
	if !nameFound {
		log.Fatal("env DB_NAME not found")
	}

	schema, schemaFound := os.LookupEnv("DB_SCHEMA")
	if !schemaFound {
		log.Fatal("env DB_SCHEMA not found")
	}

	user, userFound := os.LookupEnv("DB_USER")
	if !userFound {
		log.Fatal("env DB_USER not found")
	}

	password, passwordFound := os.LookupEnv("DB_PASSWORD")
	if !passwordFound {
		log.Fatal("env DB_PASSWORD not found")
	}

	sslMode, sslModeFound := os.LookupEnv("DB_SSL_MODE")
	if !sslModeFound {
		log.Fatal("env DB_SSL_MODE not found")
	}

	return &DB{
		Host:     host,
		Port:     port,
		Name:     name,
		Schema:   schema,
		User:     user,
		Password: password,
		SslMode:  sslMode,
	}
}
