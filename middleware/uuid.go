package middleware

import (
	"github.com/google/uuid"
	"github.com/gorilla/context"
	"net/http"
)

type UUIDMiddleware struct{}

func NewUUID() *UUIDMiddleware {
	return &UUIDMiddleware{}
}

func (u *UUIDMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	uid, err := uuid.Parse(r.Header.Get("X-Request-ID"))
	if err != nil {
		uid, _ = uuid.NewUUID()
	}

	context.Set(r, ContextUUIDKey, uid.String())
	next(w, r)
}
