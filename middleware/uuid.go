package middleware

import (
	"github.com/google/uuid"
	"github.com/gorilla/context"
	"log"
	"net/http"
)

func UUID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uid, err := uuid.Parse(r.Header.Get("x-uuid"))
		if err != nil {
			uid, _ = uuid.NewUUID()
		}

		log.Printf("[uuid] %s", uid.String())
		context.Set(r, ContextUUIDKey, uid.String())
		next.ServeHTTP(w, r)
	})
}
