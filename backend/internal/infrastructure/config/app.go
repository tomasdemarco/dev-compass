package config

import (
	"log"
	"os"
	"strconv"
)

type App struct {
	Port    int
	GinMode string
}

func LoadApp() *App {
	port, _ := os.LookupEnv("PORT")
	portInt, err := strconv.Atoi(port)
	if err != nil {
		portInt = 8080
		log.Printf("env PORT - err: %v - set default value: %d", err, portInt)
	}

	ginMode, ginModeFound := os.LookupEnv("GIN_MODE")
	if !ginModeFound {
		ginMode = "release"
		log.Printf("env GIN_MODE - err: %v - set default value: %s", err, ginMode)
	}

	return &App{
		Port:    portInt,
		GinMode: ginMode,
	}
}
