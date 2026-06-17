# TP-6: API de Aeropuertos (MongoDB + Redis)

Este proyecto implementa una API REST y un frontend interactivo con Leaflet.js para gestionar aeropuertos, realizar consultas geoespaciales de cercanía y medir la popularidad de los accesos utilizando bases de datos NoSQL.

## Arquitectura del Backend
El backend está estructurado siguiendo un diseño limpio y modular por capas:
* **`config/database.js`**: Conexiones a MongoDB y los clientes de Redis (GEO y Popularidad).
* **`models/Airport.js`**: Esquema de datos definido con Mongoose.
* **`services/airportService.js`**: Lógica de negocio y consultas (cálculos geoespaciales y estadísticas).
* **`routes/airportRoutes.js`**: Definición de los endpoints y control de respuestas HTTP.
* **`seed/airportSeed.js`**: Proceso automatizado que importa los datos de `airports.json` al arrancar.

---

## Requisitos
* Docker
* Docker Compose

---

## Cómo Levantar el Proyecto

Para compilar y levantar toda la infraestructura (MongoDB, Redis GEO, Redis Popularidad, Backend API y Frontend Nginx):

```bash
# Iniciar servicios y reconstruir imágenes
docker compose up --build -d
```

* **Frontend (Visualización Mapa):** [http://localhost:8080](http://localhost:8080)
* **Backend API:** [http://localhost:3000](http://localhost:3000)



## Endpoints de la API REST

### CRUD de Aeropuertos
* **`GET /airports`**: Devuelve la lista con todos los aeropuertos.
* **`GET /airports/:iata_code`**: Devuelve los detalles de un aeropuerto e incrementa en `+1` su contador de visitas.
* **`POST /airports`**: Crea un nuevo aeropuerto y lo registra en MongoDB y Redis GEO.
* **`PUT /airports/:iata_code`**: Modifica los datos de un aeropuerto.
* **`DELETE /airports/:iata_code`**: Elimina el aeropuerto de MongoDB, Redis GEO y el ranking.

### Consultas Especiales
* **`GET /airports/nearby?lat=..&lng=..&radius=km`**: Busca aeropuertos cercanos usando consultas de radio en Redis.
* **`GET /airports/popular`**: Devuelve los 10 aeropuertos más visitados en las últimas 24 horas (gracias al TTL configurado).
