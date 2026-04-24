package repository

import (
	"echoestate/go-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookmarkRepository interface {
	GetByUserID(userID uuid.UUID) ([]models.Bookmark, error)
	Create(b *models.Bookmark) error
	Delete(userID, propertyID uuid.UUID) error
}

type gormBookmarkRepo struct {
	db *gorm.DB
}

func NewBookmarkRepository(db *gorm.DB) BookmarkRepository {
	return &gormBookmarkRepo{db: db}
}

func (r *gormBookmarkRepo) GetByUserID(userID uuid.UUID) ([]models.Bookmark, error) {
	var bookmarks []models.Bookmark
	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&bookmarks).Error
	return bookmarks, err
}

func (r *gormBookmarkRepo) Create(b *models.Bookmark) error {
	return r.db.Create(b).Error
}

func (r *gormBookmarkRepo) Delete(userID, propertyID uuid.UUID) error {
	result := r.db.
		Where("user_id = ? AND property_id = ?", userID, propertyID).
		Delete(&models.Bookmark{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
