package handlers

import (
	"encoding/base64"
	"errors"
	"net/http"
	"strconv"
	"time"

	"echoestate/go-api/models"
	"echoestate/go-api/repository"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type PropertyHandler struct {
	repo repository.PropertyRepository
}

type listPropertiesResponse struct {
	Properties []models.Property `json:"properties"`
	NextCursor string            `json:"next_cursor"`
}

type createPropertyRequest struct {
	UserID       uuid.UUID `json:"user_id"`
	Title        string    `json:"title"`
	Address      string    `json:"address"`
	Price        int       `json:"price"`
	Bedrooms     int       `json:"bedrooms"`
	ThumbnailURL string    `json:"thumbnail_url"`
}

type updatePropertyRequest struct {
	Title        *string `json:"title"`
	Address      *string `json:"address"`
	Price        *int    `json:"price"`
	Bedrooms     *int    `json:"bedrooms"`
	ThumbnailURL *string `json:"thumbnail_url"`
}

func (h *PropertyHandler) List(c echo.Context) error {
	var filters repository.PropertyFilters

	if v := c.QueryParam("limit"); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil {
			filters.Limit = n
		}
	}

	if cursor := c.QueryParam("cursor"); cursor != "" {
		t, err := decodeCursor(cursor)
		if err != nil {
			return c.JSON(http.StatusBadRequest, errResponse("invalid cursor"))
		}
		filters.Cursor = &t
	}

	if v := c.QueryParam("location"); v != "" {
		filters.Location = v
	}
	if v := c.QueryParam("min_price"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			filters.MinPrice = &n
		}
	}
	if v := c.QueryParam("max_price"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			filters.MaxPrice = &n
		}
	}
	if v := c.QueryParam("bedrooms"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			filters.Bedrooms = &n
		}
	}

	limit := filters.Limit
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	properties, err := h.repo.List(filters)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to fetch properties"))
	}

	var nextCursor string
	if len(properties) > limit {
		nextCursor = encodeCursor(properties[limit-1].CreatedAt)
		properties = properties[:limit]
	}

	return c.JSON(http.StatusOK, listPropertiesResponse{
		Properties: properties,
		NextCursor: nextCursor,
	})
}

func (h *PropertyHandler) GetByID(c echo.Context) error {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	p, err := h.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, errResponse("property not found"))
		}
		return c.JSON(http.StatusInternalServerError, errResponse("failed to fetch property"))
	}

	return c.JSON(http.StatusOK, p)
}

func (h *PropertyHandler) Create(c echo.Context) error {
	var req createPropertyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}
	if req.Title == "" || req.Address == "" {
		return c.JSON(http.StatusBadRequest, errResponse("title and address are required"))
	}
	if req.UserID == uuid.Nil {
		return c.JSON(http.StatusBadRequest, errResponse("user_id is required"))
	}

	p := &models.Property{
		UserID:       req.UserID,
		Title:        req.Title,
		Address:      req.Address,
		Price:        req.Price,
		Bedrooms:     req.Bedrooms,
		ThumbnailURL: req.ThumbnailURL,
	}

	if err := h.repo.Create(p); err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to create property"))
	}

	return c.JSON(http.StatusCreated, p)
}

func (h *PropertyHandler) Update(c echo.Context) error {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	var req updatePropertyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}

	p, err := h.repo.Update(id, repository.UpdatePropertyFields{
		Title:        req.Title,
		Address:      req.Address,
		Price:        req.Price,
		Bedrooms:     req.Bedrooms,
		ThumbnailURL: req.ThumbnailURL,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, errResponse("property not found"))
		}
		return c.JSON(http.StatusInternalServerError, errResponse("failed to update property"))
	}

	return c.JSON(http.StatusOK, p)
}

func encodeCursor(t time.Time) string {
	return base64.URLEncoding.EncodeToString([]byte(t.UTC().Format(time.RFC3339Nano)))
}

func decodeCursor(s string) (time.Time, error) {
	b, err := base64.URLEncoding.DecodeString(s)
	if err != nil {
		return time.Time{}, err
	}
	return time.Parse(time.RFC3339Nano, string(b))
}
