# Superheroes SPA

Aplicación SPA (Single Page Application) para almacenar y gestionar información de personajes de cómics de Marvel y DC.

## Requisitos Previos
- Docker
- Docker Compose
- Make (opcional, recomendado para las recetas)

## Uso (Recetas / Makefile)

El proyecto incluye un `Makefile` para cumplir con el uso de recetas. Los comandos principales son:

- `make build`: Construye las imágenes y levanta los contenedores en segundo plano.
- `make up`: Levanta los contenedores existentes en segundo plano.
- `make seed`: Puebla la base de datos MongoDB con los 40 superhéroes y sus imágenes (requiere que los contenedores estén corriendo con `make up`).
- `make down`: Detiene todos los contenedores.
- `make logs`: Muestra los logs de los contenedores de forma continua.
- `make clean`: Detiene los contenedores y elimina los volúmenes de la base de datos (borra los datos de Mongo).

## Puesta en Marcha Inicial

Para levantar y probar el proyecto completo:

1. Ejecuta la receta de construcción:
   ```bash
   make build
   ```
2. Ejecuta la receta de seeder (población de datos):
   ```bash
   make seed
   ```
3. Accede al Frontend en tu navegador:
   **[http://localhost:5173](http://localhost:5173)**
4. Accede a la API Backend en tu navegador (opcional):
   **[http://localhost:3001/api/heroes](http://localhost:3001/api/heroes)**

## Estructura del Proyecto
- **`/frontend`**: Contiene la aplicación construida en React y Vite. Incluye validaciones, ruteo y diseño visual.
- **`/backend`**: Contiene la API REST construida en Node.js, Express y Mongoose para la conexión con MongoDB.
- **`docker-compose.yml`**: Orquestación de los contenedores para el backend, frontend y la base de datos MongoDB.
