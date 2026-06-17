.PHONY: up down build logs seed clean

up:
	docker-compose up -d

build:
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs -f

seed:
	docker-compose exec backend node seed.js

clean:
	docker-compose down -v
