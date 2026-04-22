package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) {
	e.GET("/health", health)
}

func health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
