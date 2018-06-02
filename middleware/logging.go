package middleware

import (
	"bytes"
	"github.com/gorilla/context"
	"github.com/urfave/negroni"
	"log"
	"net/http"
	"text/template"
	"time"
)

type Logger struct {
	template *template.Template
}

type LoggerEntry struct {
	StartTime string
	Status    int
	Duration  time.Duration
	Hostname  string
	Method    string
	Path      string
	Request   *http.Request
	UUID      string
}

var loggerDefaultFormat = "[{{.UUID}}] {{.Status}} {{.Duration}} - {{.Hostname}} - {{.Method}} {{.Path}}"

func NewLogger() *Logger {
	return &Logger{
		template: template.Must(template.New("logging_parser").Parse(loggerDefaultFormat)),
	}
}

func (l *Logger) ServeHTTP(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	start := time.Now()
	next(w, r)

	res := w.(negroni.ResponseWriter)
	logEntry := LoggerEntry{
		StartTime: start.Format(time.RFC3339),
		Status:    res.Status(),
		Duration:  time.Since(start),
		Hostname:  r.Host,
		Method:    r.Method,
		Path:      r.URL.Path,
		Request:   r,
		UUID:      context.Get(r, ContextUUIDKey).(string),
	}

	buff := &bytes.Buffer{}
	l.template.Execute(buff, logEntry)
	log.Print(buff.String())
}
