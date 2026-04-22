//go:build ignore

package main

import (
	"echoestate/go-api/models"
	"os"

	"ariga.io/atlas-provider-gorm/gormschema"
)

func main() {
	stmts, err := gormschema.New("postgres").Load(
		&models.User{},
		&models.Property{},
		&models.SceneClip{},
		&models.GPUJob{},
		&models.ViewMapLayout{},
		&models.Bookmark{},
	)
	if err != nil {
		os.Stderr.WriteString("failed to load GORM schema: " + err.Error())
		os.Exit(1)
	}
	os.Stdout.WriteString(stmts)
}
