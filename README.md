# Exam App

## Prereq
### Tools
* Taskfile (If you want to use Taskfile.yml)
* docker-compose

### Setup Environment Variables
Create .env file in root directory, and set them as desired.
```bash
VITE_API_URL=
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_HOST=
```

## Usage
```bash
docker-compose up --build
```

Services should be running on the shown ports in `docker-compose.yml`file.