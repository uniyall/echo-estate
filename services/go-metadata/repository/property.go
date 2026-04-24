package repository

import (
	"time"

	"echoestate/go-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PropertyFilters struct {
	Limit    int
	Cursor   *time.Time // created_at of last item from previous page; nil = first page
	Location string
	MinPrice *int
	MaxPrice *int
	Bedrooms *int
}

type UpdatePropertyFields struct {
	Title        *string
	Address      *string
	Price        *int
	Bedrooms     *int
	ThumbnailURL *string
}

type PropertyRepository interface {
	List(f PropertyFilters) ([]models.Property, error)
	GetByID(id uuid.UUID) (*models.Property, error)
	Create(p *models.Property) error
	Update(id uuid.UUID, fields UpdatePropertyFields) (*models.Property, error)
}

type gormPropertyRepo struct {
	db *gorm.DB
}

func NewPropertyRepository(db *gorm.DB) PropertyRepository {
	return &gormPropertyRepo{db: db}
}

func (r *gormPropertyRepo) List(f PropertyFilters) ([]models.Property, error) {
	limit := f.Limit
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	q := r.db.Model(&models.Property{})

	if f.Cursor != nil {
		q = q.Where("created_at < ?", f.Cursor)
	}
	if f.Location != "" {
		q = q.Where("address ILIKE ?", "%"+f.Location+"%")
	}
	if f.MinPrice != nil {
		q = q.Where("price >= ?", *f.MinPrice)
	}
	if f.MaxPrice != nil {
		q = q.Where("price <= ?", *f.MaxPrice)
	}
	if f.Bedrooms != nil {
		q = q.Where("bedrooms = ?", *f.Bedrooms)
	}

	// Fetch one extra to detect whether a next page exists.
	var properties []models.Property
	err := q.Order("created_at DESC").Limit(limit + 1).Find(&properties).Error
	return properties, err
}

func (r *gormPropertyRepo) GetByID(id uuid.UUID) (*models.Property, error) {
	var p models.Property
	err := r.db.
		Preload("SceneClips").
		Preload("ViewMapLayout").
		First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *gormPropertyRepo) Create(p *models.Property) error {
	return r.db.Create(p).Error
}

func (r *gormPropertyRepo) Update(id uuid.UUID, fields UpdatePropertyFields) (*models.Property, error) {
	var p models.Property
	if err := r.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, err
	}

	updates := make(map[string]any)
	if fields.Title != nil {
		updates["title"] = *fields.Title
	}
	if fields.Address != nil {
		updates["address"] = *fields.Address
	}
	if fields.Price != nil {
		updates["price"] = *fields.Price
	}
	if fields.Bedrooms != nil {
		updates["bedrooms"] = *fields.Bedrooms
	}
	if fields.ThumbnailURL != nil {
		updates["thumbnail_url"] = *fields.ThumbnailURL
	}

	if len(updates) == 0 {
		return &p, nil
	}

	if err := r.db.Model(&p).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &p, nil
}
