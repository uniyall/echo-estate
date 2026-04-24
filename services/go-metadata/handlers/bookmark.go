package handlers

import (
	"errors"
	"net/http"

	"echoestate/go-api/models"
	"echoestate/go-api/repository"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type BookmarkHandler struct {
	repo repository.BookmarkRepository
}

type createBookmarkRequest struct {
	UserID     uuid.UUID `json:"user_id"`
	PropertyID uuid.UUID `json:"property_id"`
}

func (h *BookmarkHandler) List(c echo.Context) error {
	userIDStr := c.QueryParam("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil || userID == uuid.Nil {
		return c.JSON(http.StatusBadRequest, errResponse("user_id query param is required"))
	}

	bookmarks, err := h.repo.GetByUserID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to fetch bookmarks"))
	}

	return c.JSON(http.StatusOK, map[string]any{"bookmarks": bookmarks})
}

func (h *BookmarkHandler) Create(c echo.Context) error {
	var req createBookmarkRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}
	if req.UserID == uuid.Nil || req.PropertyID == uuid.Nil {
		return c.JSON(http.StatusBadRequest, errResponse("user_id and property_id are required"))
	}

	b := &models.Bookmark{
		UserID:     req.UserID,
		PropertyID: req.PropertyID,
	}

	if err := h.repo.Create(b); err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to create bookmark"))
	}

	return c.JSON(http.StatusCreated, b)
}

// Delete removes a bookmark. :id is the property_id; user identity comes from X-User-ID header.
func (h *BookmarkHandler) Delete(c echo.Context) error {
	propertyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	userIDStr := c.Request().Header.Get("X-User-ID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil || userID == uuid.Nil {
		return c.JSON(http.StatusBadRequest, errResponse("X-User-ID header is required"))
	}

	if err := h.repo.Delete(userID, propertyID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, errResponse("bookmark not found"))
		}
		return c.JSON(http.StatusInternalServerError, errResponse("failed to delete bookmark"))
	}

	return c.NoContent(http.StatusNoContent)
}
