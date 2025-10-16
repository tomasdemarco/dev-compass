package config

import (
	"log"
	"os"
	"strconv"
)

type Switch struct {
	ISO *ISO
	API *API
}

type ISO struct {
	Host string
	Port,
	Timeout int
}

type API struct {
	Url     string
	Timeout int
}

func LoadSwitch() *Switch {
	return &Switch{
		ISO: loadISO(),
		API: loadAPI(),
	}
}

func loadISO() *ISO {
	host, hostFound := os.LookupEnv("SWITCH_ISO_HOST")
	if !hostFound {
		log.Fatal("env SWITCH_ISO_HOST not found")
	}

	port, portFound := os.LookupEnv("SWITCH_ISO_PORT")
	if !portFound {
		log.Fatal("env SWITCH_ISO_PORT not found")
	}

	portInt, err := strconv.Atoi(port)
	if err != nil {
		log.Fatalf("env SWITCH_ISO_PORT - err: %v", err)
	}

	timeout, _ := os.LookupEnv("SWITCH_ISO_TIMEOUT")
	timeoutInt, err := strconv.Atoi(timeout)
	if err != nil {
		timeoutInt = 15000
		log.Printf("env SWITCH_ISO_TIMEOUT - err: %v - set default value: %d", err, timeoutInt)
	}

	return &ISO{
		Host:    host,
		Port:    portInt,
		Timeout: timeoutInt,
	}
}

func loadAPI() *API {
	url, urlFound := os.LookupEnv("SWITCH_API_URL")
	if !urlFound {
		log.Fatal("env SWITCH_API_URL not found")
	}
	timeout, _ := os.LookupEnv("SWITCH_API_TIMEOUT")
	timeoutInt, err := strconv.Atoi(timeout)
	if err != nil {
		timeoutInt = 15000
		log.Printf("env SWITCH_API_TIMEOUT - err: %v - set default value: %d", err, timeoutInt)
	}

	return &API{
		Url:     url,
		Timeout: timeoutInt,
	}
}
