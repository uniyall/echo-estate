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

type ClipHandler struct {
	repo repository.ClipRepository
}

type createClipRequest struct {
	Label     string `json:"label"`
	R2ClipURL string `json:"r2_clip_url"`
}

type updateClipRequest struct {
	Status *models.ClipStatus `json:"status"`
	PlyURL *string            `json:"ply_url"`
}

func (h *ClipHandler) ListByProperty(c echo.Context) error {
	propertyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	clips, err := h.repo.ListByPropertyID(propertyID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to fetch clips"))
	}

	return c.JSON(http.StatusOK, map[string]any{"clips": clips})
}

func (h *ClipHandler) Create(c echo.Context) error {
	propertyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid property id"))
	}

	var req createClipRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}
	if req.Label == "" {
		return c.JSON(http.StatusBadRequest, errResponse("label is required"))
	}

	clip := &models.SceneClip{
		PropertyID: propertyID,
		Label:      req.Label,
		R2ClipURL:  req.R2ClipURL,
		Status:     models.ClipStatusQueued,
	}

	if err := h.repo.Create(clip); err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse("failed to create clip"))
	}

	return c.JSON(http.StatusCreated, clip)
}

func (h *ClipHandler) Update(c echo.Context) error {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid clip id"))
	}

	var req updateClipRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errResponse("invalid request body"))
	}

	clip, err := h.repo.Update(id, repository.UpdateClipFields{
		Status: req.Status,
		PlyURL: req.PlyURL,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, errResponse("clip not found"))
		}
		return c.JSON(http.StatusInternalServerError, errResponse("failed to update clip"))
	}

	return c.JSON(http.StatusOK, clip)
}
