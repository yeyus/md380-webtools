package entities

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	env "github.com/yeyus/md380-webtools/config"
	"github.com/yeyus/md380-webtools/utils"
	//	gateway "github.com/grpc-ecosystem/grpc-gateway/runtime"
	pb "github.com/yeyus/dmr-entities/model"
	"google.golang.org/grpc"
	"net/http"
)

type EntitiesRouter struct {
	ServiceEndpoint string
}

func NewEntitiesRouter(config env.Environment) EntitiesRouter {
	return EntitiesRouter{
		ServiceEndpoint: fmt.Sprintf("%s:%s", config.EntitiesServiceHost, config.EntitiesServicePort),
	}
}

func (r *EntitiesRouter) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/", r.getEntities)
}

func parseEntitiesQuery(req *http.Request) (*pb.EntitiesQuery, error) {
	decoder := json.NewDecoder(req.Body)
	var pb pb.EntitiesQuery
	err := decoder.Decode(&pb)
	return &pb, err
}

func (router *EntitiesRouter) getEntities(w http.ResponseWriter, r *http.Request) {
	conn, err := grpc.Dial(router.ServiceEndpoint, grpc.WithInsecure())
	if err != nil {
		e := utils.NewHTTPJsonError(503, "error while creating grpc socket %s", err.Error())
		e.Send(w)
		return
	}
	defer conn.Close()

	client := pb.NewEntitiesClient(conn)
	query, err := parseEntitiesQuery(r)
	defer r.Body.Close()
	if err != nil {
		e := utils.NewHTTPJsonError(400, "error while parsing EntitiesQuery payload: %s", err.Error())
		e.Send(w)
		return
	}

	ctx := context.Background()
	entities, err := client.GetEntity(ctx, query)
	if err != nil {
		e := utils.NewHTTPJsonError(500, "error while calling GetEntity: %s", err.Error())
		e.Send(w)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entities)
}
