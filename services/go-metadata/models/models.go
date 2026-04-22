package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base gives every model a UUID primary key + timestamps
type Base struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

type User struct {
	Base
	Email        string     `gorm:"type:varchar(255);uniqueIndex;not null"`
	PasswordHash string     `gorm:"type:varchar(255);not null"`
	Properties   []Property `gorm:"foreignKey:UserID"` // ← explicit
}

type Property struct {
	Base
	UserID        uuid.UUID `gorm:"type:uuid;not null;index"`
	User          *User     `gorm:"foreignKey:UserID"`
	Title         string    `gorm:"type:varchar(255);not null"`
	Address       string    `gorm:"type:text;not null"`
	Price         int
	Bedrooms      int
	ThumbnailURL  string         `gorm:"type:text"`
	SceneClips    []SceneClip    `gorm:"foreignKey:PropertyID"` // ← explicit
	ViewMapLayout *ViewMapLayout `gorm:"foreignKey:PropertyID"` // ← explicit
	Bookmarks     []Bookmark     `gorm:"foreignKey:PropertyID"` // ← explicit
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
	PropertyID uuid.UUID  `gorm:"type:uuid;not null;index"`
	Property   *Property  `gorm:"foreignKey:PropertyID"`
	Label      string     `gorm:"type:varchar(255);not null"`
	Status     ClipStatus `gorm:"type:varchar(20);default:'queued'"`
	R2ClipURL  string     `gorm:"type:text"`
	PlyURL     string     `gorm:"type:text"`
	GPUJob     *GPUJob    `gorm:"foreignKey:ClipID"` // ← explicit FK tag
}

type GPUJob struct {
	Base
	ClipID       uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex"`
	SceneClip    *SceneClip `gorm:"foreignKey:ClipID"`
	RunpodJobID  string     `gorm:"type:varchar(255)"`
	LastPolledAt *time.Time
	Steps        int
}

type ViewMapLayout struct {
	Base
	PropertyID   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"`
	Property     *Property `gorm:"foreignKey:PropertyID"`
	FloorPlanURL string    `gorm:"type:text"`
	LayoutJSON   string    `gorm:"type:jsonb;default:'{\"bubbles\":[]}'"`
}

type Bookmark struct {
	UserID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	PropertyID uuid.UUID `gorm:"type:uuid;primaryKey"`
	User       *User     `gorm:"foreignKey:UserID"`     // ← pointer + explicit
	Property   *Property `gorm:"foreignKey:PropertyID"` // ← pointer + explicit
	CreatedAt  time.Time
}
