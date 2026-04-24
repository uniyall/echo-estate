package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RawJSON stores as a plain string in Postgres (jsonb-compatible) but
// serializes as a JSON value rather than a quoted string.
type RawJSON string

func (r RawJSON) MarshalJSON() ([]byte, error) {
	b := []byte(r)
	if len(b) == 0 || !json.Valid(b) {
		return []byte(`{"bubbles":[]}`), nil
	}
	return b, nil
}

type Base struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

type User struct {
	Base
	Email        string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"`
	Properties   []Property `gorm:"foreignKey:UserID" json:"properties,omitempty"`
}

type Property struct {
	Base
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User          *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Title         string         `gorm:"type:varchar(255);not null" json:"title"`
	Address       string         `gorm:"type:text;not null" json:"address"`
	Price         int            `json:"price"`
	Bedrooms      int            `json:"bedrooms"`
	ThumbnailURL  string         `gorm:"type:text" json:"thumbnail_url,omitempty"`
	SceneClips    []SceneClip    `gorm:"foreignKey:PropertyID" json:"scene_clips"`
	ViewMapLayout *ViewMapLayout `gorm:"foreignKey:PropertyID" json:"view_map_layout"`
	Bookmarks     []Bookmark     `gorm:"foreignKey:PropertyID" json:"bookmarks,omitempty"`
}

type ClipStatus string

const (
	ClipStatusQueued     ClipStatus = "queued"
	ClipStatusProcessing ClipStatus = "processing"
	ClipStatusReady      ClipStatus = "ready"
	ClipStatusFailed     ClipStatus = "failed"
)

type SceneClip struct {
	Base
	PropertyID uuid.UUID  `gorm:"type:uuid;not null;index" json:"property_id"`
	Property   *Property  `gorm:"foreignKey:PropertyID" json:"-"`
	Label      string     `gorm:"type:varchar(255);not null" json:"label"`
	Status     ClipStatus `gorm:"type:varchar(20);default:'queued'" json:"status"`
	R2ClipURL  string     `gorm:"type:text" json:"r2_clip_url,omitempty"`
	PlyURL     string     `gorm:"type:text" json:"ply_url,omitempty"`
	GPUJob     *GPUJob    `gorm:"foreignKey:ClipID" json:"gpu_job,omitempty"`
}

type GPUJob struct {
	Base
	ClipID       uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex" json:"clip_id"`
	SceneClip    *SceneClip `gorm:"foreignKey:ClipID" json:"-"`
	RunpodJobID  string     `gorm:"type:varchar(255)" json:"runpod_job_id"`
	LastPolledAt *time.Time `json:"last_polled_at,omitempty"`
	Steps        int        `json:"steps"`
}

type ViewMapLayout struct {
	Base
	PropertyID   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"property_id"`
	Property     *Property `gorm:"foreignKey:PropertyID" json:"-"`
	FloorPlanURL string    `gorm:"type:text" json:"floor_plan_url,omitempty"`
	LayoutJSON   RawJSON   `gorm:"type:jsonb;default:'{\"bubbles\":[]}'" json:"layout_json"`
}

type Bookmark struct {
	UserID     uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	PropertyID uuid.UUID `gorm:"type:uuid;primaryKey" json:"property_id"`
	User       *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Property   *Property `gorm:"foreignKey:PropertyID" json:"property,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}
