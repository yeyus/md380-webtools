package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type HTTPJsonError struct {
	Message string `json:"message"`
	Code    int    `json:"-"`
}

func (h *HTTPJsonError) Send(w http.ResponseWriter) {

	log.Printf("[httpError] {%d} %s", h.Code, h.Message)

	json, err := json.Marshal(h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(h.Code)
	w.Write(json)
}

func NewHTTPJsonError(code int, format string, a ...interface{}) HTTPJsonError {
	message := fmt.Sprintf(format, a)
	return HTTPJsonError{
		Message: message,
		Code:    code,
	}
}
