package repository

import (
	"errors"

	"echoestate/go-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ViewMapRepository interface {
	GetByPropertyID(propertyID uuid.UUID) (*models.ViewMapLayout, error)
	Upsert(propertyID uuid.UUID, floorPlanURL string, layoutJSON string) (*models.ViewMapLayout, error)
}

type gormViewMapRepo struct {
	db *gorm.DB
}

func NewViewMapRepository(db *gorm.DB) ViewMapRepository {
	return &gormViewMapRepo{db: db}
}

func (r *gormViewMapRepo) GetByPropertyID(propertyID uuid.UUID) (*models.ViewMapLayout, error) {
	var layout models.ViewMapLayout
	err := r.db.Where("property_id = ?", propertyID).First(&layout).Error
	if err != nil {
		return nil, err
	}
	return &layout, nil
}

func (r *gormViewMapRepo) Upsert(propertyID uuid.UUID, floorPlanURL string, layoutJSON string) (*models.ViewMapLayout, error) {
	var layout models.ViewMapLayout
	err := r.db.Where("property_id = ?", propertyID).First(&layout).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	layout.PropertyID = propertyID
	layout.FloorPlanURL = floorPlanURL
	layout.LayoutJSON = models.RawJSON(layoutJSON)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		if err := r.db.Create(&layout).Error; err != nil {
			return nil, err
		}
	} else {
		if err := r.db.Save(&layout).Error; err != nil {
			return nil, err
		}
	}

	return &layout, nil
}
