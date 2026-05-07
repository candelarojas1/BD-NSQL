# SuperheroesDB

Una aplicación SPA moderna y full-stack que muestra un directorio de superhéroes de Marvel y DC con un tema oscuro.

## Uso

1. **Iniciar la aplicación y la base de datos**

   ```bash
   make up
   # O utilizando Docker Compose directamente: docker-compose up --build -d
   ```

2. **Ejecuta la inicialización de la base de datos**

   ```bash
   make seed
   # O utilizando Docker Compose directamente: docker-compose exec backend npm run seed
   ```

3. **Acceder a la aplicación**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API de backend: [http://localhost:3001/api/heroes](http://localhost:3001/api/heroes)

4. **Detener la aplicación**
   ```bash
   make down
   ```

## Stack

- Frontend: React, Vite, React Router v6, módulos CSS puros
- Backend: Node.js, Express, Mongoose
- Base de datos: MongoDB
- Orquestación: Docker Compose
