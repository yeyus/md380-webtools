package main

import (
	"github.com/gorilla/mux"
	"github.com/yeyus/md380-webtools/api/entities"
	"github.com/yeyus/md380-webtools/api/health"
	"github.com/yeyus/md380-webtools/config"
	"github.com/yeyus/md380-webtools/middleware"
	"log"
	"net/http"
)

func main() {
	env := config.GetConfig()
	staticAssets := http.FileServer(http.Dir("dist"))

	// API endpoints
	router := mux.NewRouter()
	entitiesRouter := router.PathPrefix("/api/entities").Subrouter()
	er := entities.NewEntitiesRouter(env)
	er.RegisterRoutes(entitiesRouter)

	// Health and metrics
	router.HandleFunc("/healthz", health.Handler)

	// Static assets
	router.Handle("/*", staticAssets)

	// HTML serving
	http.Handle("/", middleware.UUID(router))

	log.Println("Listening to port 8080...")
	http.ListenAndServe(":8080", nil)
}
