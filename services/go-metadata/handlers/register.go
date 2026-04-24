package handlers

import (
	"net/http"

	"echoestate/go-api/repository"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func Register(e *echo.Echo, db *gorm.DB) {
	ph := &PropertyHandler{repo: repository.NewPropertyRepository(db)}
	ch := &ClipHandler{repo: repository.NewClipRepository(db)}
	vmh := &ViewMapHandler{repo: repository.NewViewMapRepository(db)}
	bmh := &BookmarkHandler{repo: repository.NewBookmarkRepository(db)}

	e.GET("/health", health)

	e.GET("/properties", ph.List)
	e.POST("/properties", ph.Create)
	e.GET("/properties/:id", ph.GetByID)
	e.PATCH("/properties/:id", ph.Update)

	e.GET("/properties/:id/clips", ch.ListByProperty)
	e.POST("/properties/:id/clips", ch.Create)
	e.PATCH("/clips/:id", ch.Update)

	e.GET("/properties/:id/viewmap", vmh.Get)
	e.PUT("/properties/:id/viewmap", vmh.Upsert)

	e.GET("/bookmarks", bmh.List)
	e.POST("/bookmarks", bmh.Create)
	e.DELETE("/bookmarks/:id", bmh.Delete)
}

func health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
