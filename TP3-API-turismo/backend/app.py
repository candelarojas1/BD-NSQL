from flask import Flask, request, jsonify
import redis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

r = redis.Redis(host='redis', port=6379, decode_responses=True)

@app.route('/')
def home():
    return "API Turismo funcionando"

@app.route('/lugares', methods=['POST'])
def agregar_lugar():
    data = request.json
    r.geoadd(data['tipo'], (float(data['lng']), float(data['lat']), data['nombre']))
    return jsonify({"mensaje": "Lugar agregado"})

@app.route('/lugares', methods=['GET'])
def obtener_cercanos():
    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))
    tipo = request.args.get('tipo')
    lugares = r.georadius(tipo, lng, lat, 5, unit='km', withdist=True)
    return jsonify([{"nombre": l, "distancia_km": d} for l, d in lugares])

@app.route('/distancia')
def distancia():
    tipo    = request.args.get('tipo')
    destino = request.args.get('destino')
    lat     = float(request.args.get('lat'))
    lng     = float(request.args.get('lng'))

    key_tmp = f"_tmp_{tipo}"
    r.geoadd(key_tmp, (lng, lat, "usuario"))
    r.geoadd(key_tmp, *[
        (lng2, lat2, nombre)
        for nombre, lat2, lng2 in [
            (destino, *r.geopos(tipo, destino)[0][::-1])
        ]
    ])

    d = r.geodist(key_tmp, "usuario", destino, unit='km')
    r.delete(key_tmp)

    return jsonify({"distancia_km": round(float(d), 4)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)