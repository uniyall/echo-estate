package repository

import (
	"echoestate/go-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UpdateClipFields struct {
	Status *models.ClipStatus
	PlyURL *string
}

type ClipRepository interface {
	ListByPropertyID(propertyID uuid.UUID) ([]models.SceneClip, error)
	Create(clip *models.SceneClip) error
	Update(id uuid.UUID, fields UpdateClipFields) (*models.SceneClip, error)
}

type gormClipRepo struct {
	db *gorm.DB
}

func NewClipRepository(db *gorm.DB) ClipRepository {
	return &gormClipRepo{db: db}
}

func (r *gormClipRepo) ListByPropertyID(propertyID uuid.UUID) ([]models.SceneClip, error) {
	var clips []models.SceneClip
	err := r.db.
		Where("property_id = ?", propertyID).
		Order("created_at ASC").
		Find(&clips).Error
	return clips, err
}

func (r *gormClipRepo) Create(clip *models.SceneClip) error {
	return r.db.Create(clip).Error
}

func (r *gormClipRepo) Update(id uuid.UUID, fields UpdateClipFields) (*models.SceneClip, error) {
	var clip models.SceneClip
	if err := r.db.First(&clip, "id = ?", id).Error; err != nil {
		return nil, err
	}

	updates := make(map[string]any)
	if fields.Status != nil {
		updates["status"] = *fields.Status
	}
	if fields.PlyURL != nil {
		updates["ply_url"] = *fields.PlyURL
	}

	if len(updates) == 0 {
		return &clip, nil
	}

	if err := r.db.Model(&clip).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &clip, nil
}
