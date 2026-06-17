# API de Turismo (Geo Redis)

Este proyecto es una API de puntos de interés para turistas que utiliza funciones geoespaciales de Redis (Geo Redis). Permite agregar lugares de interés en diversas categorías, buscar lugares dentro de un radio de 5 km a la redonda de la ubicación del usuario, y calcular la distancia exacta entre el usuario y un destino seleccionado.

El sistema se compone de tres contenedores independientes orquestados con **Docker Compose**:
1. **Frontend**: Servidor web Nginx que sirve la interfaz de usuario estática (HTML, CSS, JS).
2. **Backend**: API REST desarrollada en Python con Flask que interactúa con Redis.
3. **Database**: Contenedor oficial de Redis (versión 7).

---

## Requisitos Previos

- Tener instalado **Docker** y **Docker Compose** en tu máquina.

---

## Cómo Ejecutar el Proyecto

1. Levanta los contenedores en segundo plano utilizando Docker Compose:
   ```bash
   docker compose up --build -d
   ```

2. Una vez finalizada la construcción, el sistema estará disponible en los siguientes puertos:
   - **Frontend (Interfaz de Usuario)**: [http://localhost:8080](http://localhost:8080)
   - **Backend (API REST)**: [http://localhost:5001](http://localhost:5001)
   - **Redis (Base de datos)**: Puerto `6379` (mapeado localmente)

3. Para detener y remover los contenedores:
   ```bash
   docker compose down
   ```

---

## Funcionalidades y Consignas Cumplidas

El proyecto implementa y cumple con los siguientes requisitos:

1. **Grupos de Interés (Categorías)**:
   - Cervecerías artesanales (`cervecerias`)
   - Universidades (`universidades`)
   - Farmacias (`farmacias`)
   - Centros de atención de emergencias (`emergencias`)
   - Supermercados (`supermercados`)

2. **Cliente para Agregar Lugares**: 
   - Interfaz interactiva de carga (Paso 1) donde se ingresa el nombre, la categoría, la latitud y longitud del lugar para persistirlo en Redis.

3. **Búsqueda en Radio de 5 km**:
   - Muestra de forma dinámica (Paso 2) los lugares de una categoría que se encuentren a 5 km o menos de las coordenadas provistas por el usuario.

4. **Cálculo de Distancia**:
   - Permite elegir uno de los puntos encontrados en la búsqueda de 5 km (Paso 3) y calcula la distancia exacta (en kilómetros) desde la ubicación del usuario hasta ese punto de interés.

---


## Estructura del Proyecto

```text
TP3-API-turismo/
├── backend/
│   ├── app.py             # Código de la API Flask
│   ├── Dockerfile         # Configuración del contenedor de backend
│   └── requirements.txt   # Dependencias de Python (Flask, Redis, Flask-CORS)
├── frontend/
│   ├── index.html         # Interfaz web del cliente
│   ├── style.css          # Estilos visuales
│   ├── app.js             # Lógica JavaScript y peticiones Fetch
│   └── Dockerfile         # Servidor web Nginx para el frontend
├── docker-compose.yml     # Orquestación de servicios
└── README.md              # Documentación del proyecto (este archivo)
```
