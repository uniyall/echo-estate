package main

import (
	"log"
	"os"

	"echoestate/go-api/db"
	"echoestate/go-api/handlers"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, using environment variables")
	}

	db.Connect()

	e := echo.New()

	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	handlers.Register(e, db.DB)

	port := os.Getenv("GO_PORT")
	if port == "" {
		port = "8080"
	}

	e.Logger.Fatal(e.Start(":" + port))
}
