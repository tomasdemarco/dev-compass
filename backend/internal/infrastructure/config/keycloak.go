package config

import (
	"log"
	"os"
	"strconv"
)

type Keycloak struct {
	Url,
	Realm,
	ClientID,
	GroupID string
	Timeout int
}

func LoadKeycloak() *Keycloak {
	url, found := os.LookupEnv("KEYCLOAK_URL")
	if !found {
		log.Fatal("env KEYCLOAK_URL not found")
	}

	realm, found := os.LookupEnv("KEYCLOAK_REALM")
	if !found {
		log.Fatal("env KEYCLOAK_REALM not found")
	}

	clientId, found := os.LookupEnv("KEYCLOAK_CLIENT_ID")
	if !found {
		log.Fatal("env KEYCLOAK_CLIENT_ID not found")
	}

	groupId, found := os.LookupEnv("KEYCLOAK_GROUP_ID")
	if !found {
		log.Fatal("env KEYCLOAK_GROUP_ID not found")
	}

	timeout, _ := os.LookupEnv("KEYCLOAK_TIMEOUT")
	timeoutInt, err := strconv.Atoi(timeout)
	if err != nil {
		timeoutInt = 15000
		log.Printf("env KEYCLOAK_TIMEOUT - err: %v - set default value: %d", err, timeoutInt)
	}

	return &Keycloak{
		Url:      url,
		Realm:    realm,
		ClientID: clientId,
		GroupID:  groupId,
		Timeout:  timeoutInt,
	}
}
