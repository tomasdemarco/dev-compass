package config

import (
	"log"
)

type Config struct {
	App    *App
	DB     *DB
	GitLab *GitLab
}

func Load() *Config {
	configAws := LoadAwsCredential()

	ssmClient := SetAwsSession(*configAws)

	ssmPath := "/ECS/DevCompass/"
	err := LoadSSMParameters(ssmClient, ssmPath, "")
	if err != nil {
		log.Printf("error when loading SSM parameters: %v", err)
	}

	return &Config{
		App:    LoadApp(),
		DB:     LoadDB(),
		GitLab: LoadGitLab(),
	}
}
