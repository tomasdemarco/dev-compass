package config

import (
	"log"
	"os"
)

type GitLab struct {
	Token       string
	GroupToScan string
}

func LoadGitLab() *GitLab {
	token, found := os.LookupEnv("GITLAB_API_TOKEN")
	if !found {
		// No hacemos log.Fatal aquí, porque solo es necesario para el seeding.
		log.Println("WARN: env GITLAB_API_TOKEN not found. Discovery process will not work.")
	}

	group, found := os.LookupEnv("GITLAB_GROUP_TO_SCAN")
	if !found {
		log.Println("WARN: env GITLAB_GROUP_TO_SCAN not found. Discovery process will not work.")
	}

	return &GitLab{
		Token:       token,
		GroupToScan: group,
	}
}
