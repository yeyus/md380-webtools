package main

import (
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
	"github.com/yeyus/md380-webtools/api/entities"
	"github.com/yeyus/md380-webtools/api/health"
	"github.com/yeyus/md380-webtools/config"
	"github.com/yeyus/md380-webtools/middleware"
	"log"
	"net/http"
)

func main() {
	env := config.GetConfig()

	// API endpoints
	router := mux.NewRouter()
	entitiesRouter := router.PathPrefix("/api/entities").Subrouter()
	er := entities.NewEntitiesRouter(env)
	er.RegisterRoutes(entitiesRouter)

	// Health and metrics
	router.HandleFunc("/healthz", health.Handler)

	// HTML serving
	n := negroni.New()
	n.Use(middleware.NewUUID())
	n.Use(middleware.NewLogger())
	n.Use(negroni.NewStatic(http.Dir("dist")))
	n.UseHandler(router)
	http.Handle("/", n)

	log.Println("Listening to port 8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Panicf("error instantiating http server: %s", err.Error())
	}
}
