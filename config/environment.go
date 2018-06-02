package config

import (
	"github.com/kelseyhightower/envconfig"
	"log"
)

type Environment struct {
	EntitiesServiceHost string `envconfig:"ENTITIES_SERVICE_HOST"`
	EntitiesServicePort string `envconfig:"ENTITIES_SERVICE_PORT"`
}

func GetConfig() Environment {
	var env Environment
	err := envconfig.Process("md380webtools", &env)
	if err != nil {
		log.Fatalf("[config] Error while parsing configs: %s", err.Error())
	}

	return env
}
