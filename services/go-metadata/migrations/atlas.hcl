data "external_schema" "gorm" {
  program = [
    "go",
    "run",
    "../db/loader.go",
  ]
}

env "local" {
  src = data.external_schema.gorm.url
  url = "postgres://postgres:postgres@localhost:5432/echo_estate?sslmode=disable"
  dev = "docker://postgres/16/dev"
  migration {
    dir = "file://."
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "production" {
  src = data.external_schema.gorm.url
  url = getenv("DATABASE_URL")
  migration {
    dir = "file://."
  }
}