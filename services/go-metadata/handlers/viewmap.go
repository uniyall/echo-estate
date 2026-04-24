package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"echoestate/go-api/repository"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ViewMapHandler struct {
	repo repository.ViewMapRepository
}

type upsertViewMapRequest struct {
	FloorPlanURL string          `json:"floor_plan_url"`
	LayoutJSON   json.RawMessage `json:"layout_json"`
}

func (h *ViewMapHandler) Get(c echo.Context) error {
	propertyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	layout, err := h.repo.GetByPropertyID(propertyID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, errResponse("view map not found"))
		}
		return c.JSON(http.StatusInternalServerError, errResponse("failed to fetch view map"))
	}

	return c.JSON(http.StatusOK, layout)
}

func (h *ViewMapHandler) Upsert(c echo.Context) error {
	propertyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	var req upsertViewMapRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}

	layoutStr := `{"bubbles":[]}`
	if len(req.LayoutJSON) > 0 {
		layoutStr = string(req.LayoutJSON)
	}

	layout, err := h.repo.Upsert(propertyID, req.FloorPlanURL, layoutStr)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to save view map"))
	}

	return c.JSON(http.StatusOK, layout)
}
