.PHONY: up down seed

up:
	docker-compose up --build -d

down:
	docker-compose down

seed:
	docker-compose exec backend npm run seed
