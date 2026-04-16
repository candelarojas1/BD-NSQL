import redis
import json
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

CHAPTERS = [
    {"season": 1, "number": 1,  "es": "El mandaloriano",         "en": "The Mandalorian"},
    {"season": 1, "number": 2,  "es": "El niño",                 "en": "The Child"},
    {"season": 1, "number": 3,  "es": "El pecado",               "en": "The Sin"},
    {"season": 1, "number": 4,  "es": "Santuario",               "en": "Sanctuary"},
    {"season": 1, "number": 5,  "es": "El pistolero",            "en": "The Gunslinger"},
    {"season": 1, "number": 6,  "es": "El prisionero",           "en": "The Prisoner"},
    {"season": 1, "number": 7,  "es": "El ajuste de cuentas",    "en": "The Reckoning"},
    {"season": 1, "number": 8,  "es": "Redención",               "en": "Redemption"},
    {"season": 2, "number": 9,  "es": "El mariscal",             "en": "The Marshal"},
    {"season": 2, "number": 10, "es": "La pasajera",             "en": "The Passenger"},
    {"season": 2, "number": 11, "es": "La heredera",             "en": "The Heiress"},
    {"season": 2, "number": 12, "es": "El asedio",               "en": "The Siege"},
    {"season": 2, "number": 13, "es": "La Jedi",                 "en": "The Jedi"},
    {"season": 2, "number": 14, "es": "La tragedia",             "en": "The Tragedy"},
    {"season": 2, "number": 15, "es": "El creyente",             "en": "The Believer"},
    {"season": 2, "number": 16, "es": "El rescate",              "en": "The Rescue"},
    {"season": 3, "number": 17, "es": "El apóstata",             "en": "The Apostate"},
    {"season": 3, "number": 18, "es": "Las minas de Mandalore",  "en": "The Mines of Mandalore"},
    {"season": 3, "number": 19, "es": "El converso",             "en": "The Convert"},
    {"season": 3, "number": 20, "es": "El huérfano",             "en": "The Foundling"},
    {"season": 3, "number": 21, "es": "El pirata",               "en": "The Pirate"},
    {"season": 3, "number": 22, "es": "Pistoleros a sueldo",     "en": "Guns for Hire"},
    {"season": 3, "number": 23, "es": "Los espías",              "en": "The Spies"},
    {"season": 3, "number": 24, "es": "El regreso",              "en": "The Return"},
]

RESERVE_TTL = 240   # 4 minutos en segundos
RENT_TTL    = 86400 # 24 horas en segundos

def chapter_key(n):
    return f"chapter:{n}"

def get_status(n):
    key = chapter_key(n)
    data = r.get(key)
    if not data:
        return {"status": "disponible", "ttl": None, "price": None}
    parsed = json.loads(data)
    ttl = r.ttl(key)
    parsed["ttl"] = ttl if ttl > 0 else None
    return parsed


# ─── RUTAS ──────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html", chapters=CHAPTERS)


@app.route("/api/chapters", methods=["GET"])
def list_chapters():
    """Punto 1 — listar capítulos con su estado actual."""
    result = []
    for ch in CHAPTERS:
        n = ch["number"]
        st = get_status(n)
        result.append({**ch, **st})
    return jsonify(result)


@app.route("/api/chapters/<int:n>/rent", methods=["POST"])
def rent_chapter(n):
    """Punto 2 — alquilar: reserva por 4 minutos hasta confirmar pago."""
    if not any(c["number"] == n for c in CHAPTERS):
        return jsonify({"error": "Capítulo no encontrado"}), 404

    st = get_status(n)
    if st["status"] != "disponible":
        return jsonify({"error": f"El capítulo no está disponible (estado: {st['status']})"}), 409

    data = json.dumps({"status": "reservado", "price": None})
    r.setex(chapter_key(n), RESERVE_TTL, data)

    return jsonify({
        "message": f"Capítulo {n} reservado. Tenés {RESERVE_TTL // 60} minutos para confirmar el pago.",
        "chapter": n,
        "status": "reservado",
        "ttl": RESERVE_TTL
    })


@app.route("/api/chapters/<int:n>/confirm", methods=["POST"])
def confirm_payment(n):
    """Punto 3 — confirmar pago: recibe número y precio, registra alquiler por 24 hs."""
    if not any(c["number"] == n for c in CHAPTERS):
        return jsonify({"error": "Capítulo no encontrado"}), 404

    body = request.get_json(silent=True) or {}
    price = body.get("price")

    if price is None:
        return jsonify({"error": "Falta el campo 'price'"}), 400
    try:
        price = float(price)
        if price <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "El precio debe ser un número mayor a 0"}), 400

    st = get_status(n)
    if st["status"] != "reservado":
        return jsonify({"error": f"El capítulo no está reservado (estado: {st['status']})"}), 409

    data = json.dumps({"status": "alquilado", "price": round(price, 2)})
    r.setex(chapter_key(n), RENT_TTL, data)

    return jsonify({
        "message": f"Pago confirmado. Capítulo {n} alquilado por 24 hs.",
        "chapter": n,
        "status": "alquilado",
        "price": round(price, 2),
        "ttl": RENT_TTL
    })


if __name__ == "__main__":
    app.run(debug=True)
