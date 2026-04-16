# The Mandalorian — Sistema de Alquiler

Sistema de alquiler de capítulos construido con Flask y Redis.

Instalacion

### 1. Levantar Redis con Docker

```bash
docker run -d --name redis-mandalorian -p 6379:6379 redis
```

### 2. Crear entorno virtual e instalar dependencias

```bash
python -m venv venv



# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3.Correr la app

```bash
python app.py
```

---

## Rutas de la API

| Método | Ruta                        | Descripción                             |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/api/chapters`             | Lista todos los capítulos con su estado |
| POST   | `/api/chapters/<n>/rent`    | Reserva el capítulo por 4 minutos       |
| POST   | `/api/chapters/<n>/confirm` | Confirma el pago y alquila por 24 hs    |

### Ejemplo — confirmar pago

```bash
curl -X POST http://localhost:5000/api/chapters/1/confirm \
  -H "Content-Type: application/json" \
  -d '{"price": 2.99}'
```

---

## Estados de un capítulo

- **disponible** — se puede alquilar
- **reservado** — esperando confirmación de pago (expira en 4 minutos)
- **alquilado** — pago confirmado, disponible nuevamente en 24 hs

---

## Estructura del proyecto

```
mandalorian/
├── app.py                  # Flask + rutas API
├── requirements.txt
├── README.md
├── templates/
│   └── index.html          # Template principal
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```
