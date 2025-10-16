package postgres

import (
	"context"
	"encoding/json"
	"gorm.io/gorm/logger"
	"log"
	"time"
)

type gormLogger struct {
	logger.Interface
}

type logEntry struct {
	Time     string `json:"time,omitempty"`
	Id       string `json:"id,omitempty"`
	Level    string `json:"level"`
	Message  string `json:"message,omitempty"`
	SQL      string `json:"sql,omitempty"`
	Rows     int64  `json:"rows,omitempty"`
	Error    error  `json:"error,omitempty"`
	Duration string `json:"duration,omitempty"`
}

func (g *gormLogger) LogMode(level logger.LogLevel) logger.Interface {
	return g
}

func (g *gormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	entry := logEntry{Level: "info", Message: msg}
	logJSON(entry)
}

func (g *gormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	entry := logEntry{Level: "warn", Message: msg}
	logJSON(entry)
}

func (g *gormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	entry := logEntry{Level: "error", Message: msg}
	logJSON(entry)
}

func (g *gormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	var requestId string
	requestIdCtx := ctx.Value("requestId")
	if requestIdString, ok := requestIdCtx.(string); ok {
		requestId = requestIdString
	}

	sql, rows := fc()
	entry := logEntry{
		Time:     time.Now().Format("2006-01-02 15:04:05.000"),
		Id:       requestId,
		Level:    "trace",
		SQL:      sql,
		Rows:     rows,
		Error:    err,
		Duration: time.Since(begin).String(),
	}
	logJSON(entry)
}

func logJSON(entry logEntry) {
	jsonData, err := json.Marshal(entry)
	if err != nil {
		log.Fatalf("failed to marshal JSON: %v", err)
	}
	log.Println(string(jsonData))
}
