import Airport from '../models/Airport.js';
import { redisGeoClient, redisPopClient } from '../config/database.js';

/**
 * Obtiene todos los aeropuertos con información mínima (para la lista de marcadores del mapa).
 */
export async function getAllAirports() {
  return await Airport.find({}, { name: 1, city: 1, iata_faa: 1, lat: 1, lng: 1 });
}

/**
 * Obtiene los detalles de un aeropuerto por su código IATA.
 * También incrementa el contador de visitas en Redis Popularidad y renueva el TTL a 1 día.
 */
export async function getAirportByIata(iataCode) {
  const iata = iataCode.toUpperCase();
  const airport = await Airport.findOne({ iata_faa: iata });
  if (!airport) return null;

  // Incrementar popularidad en +1
  await redisPopClient.zIncrBy('airport_popularity', 1, iata);
  // Establecer/renovar el TTL de 1 día (86400 segundos)
  await redisPopClient.expire('airport_popularity', 86400);

  // Obtener el puntaje (visitas) actual
  const visits = await redisPopClient.zScore('airport_popularity', iata);

  return {
    ...airport.toJSON(),
    visits: visits || 0
  };
}

/**
 * Crea un nuevo aeropuerto en MongoDB y agrega sus coordenadas a Redis GEO.
 */
export async function createAirport(data) {
  const { name, city, iata_faa, icao, lat, lng, alt, tz } = data;
  const iata = iata_faa.trim().toUpperCase();

  const existing = await Airport.findOne({ iata_faa: iata });
  if (existing) {
    throw new Error(`Ya existe un aeropuerto con el código IATA "${iata}".`);
  }

  const newAirport = new Airport({
    name,
    city,
    iata_faa: iata,
    icao: icao || '',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    alt: parseFloat(alt) || 0,
    tz: tz || ''
  });

  await newAirport.save();

  // Agregar coordenadas a Redis GEO
  await redisGeoClient.geoAdd('airports-geo', {
    longitude: parseFloat(lng),
    latitude: parseFloat(lat),
    member: iata
  });

  return newAirport;
}

/**
 * Modifica un aeropuerto existente y actualiza sus coordenadas en Redis GEO si cambiaron.
 */
export async function updateAirport(iataCode, data) {
  const iata = iataCode.toUpperCase();
  const { name, city, icao, lat, lng, alt, tz } = data;

  const airport = await Airport.findOne({ iata_faa: iata });
  if (!airport) return null;

  if (name !== undefined) airport.name = name;
  if (city !== undefined) airport.city = city;
  if (icao !== undefined) airport.icao = icao;
  if (alt !== undefined) airport.alt = parseFloat(alt);
  if (tz !== undefined) airport.tz = tz;

  let coordsChanged = false;
  if (lat !== undefined && parseFloat(lat) !== airport.lat) {
    airport.lat = parseFloat(lat);
    coordsChanged = true;
  }
  if (lng !== undefined && parseFloat(lng) !== airport.lng) {
    airport.lng = parseFloat(lng);
    coordsChanged = true;
  }

  await airport.save();

  if (coordsChanged) {
    // Si las coordenadas cambiaron, actualizarlas también en Redis GEO
    await redisGeoClient.geoAdd('airports-geo', {
      longitude: airport.lng,
      latitude: airport.lat,
      member: iata
    });
  }

  return airport;
}

/**
 * Elimina un aeropuerto de MongoDB, Redis GEO y Redis Popularidad.
 */
export async function deleteAirport(iataCode) {
  const iata = iataCode.toUpperCase();
  const airport = await Airport.findOneAndDelete({ iata_faa: iata });
  if (!airport) return null;

  // Eliminar de Redis GEO y Redis Popularidad
  await redisGeoClient.zRem('airports-geo', iata);
  await redisPopClient.zRem('airport_popularity', iata);

  return airport;
}

/**
 * Busca aeropuertos dentro de un radio dado (km) usando Redis GEO.
 * Combina la distancia geográfica con los datos completos del aeropuerto desde MongoDB.
 */
export async function getNearbyAirports(lat, lng, radius) {
  const geoResults = await redisGeoClient.geoRadiusWith(
    'airports-geo',
    { longitude: lng, latitude: lat },
    radius,
    'km',
    ['WITHDIST'],
    { SORT: 'ASC' }
  );

  const iataCodes = geoResults.map(r => r.member);
  const airports = await Airport.find({ iata_faa: { $in: iataCodes } });
  const airportMap = new Map(airports.map(a => [a.iata_faa, a]));

  return geoResults.map(r => {
    const airport = airportMap.get(r.member);
    if (!airport) return null;
    return {
      ...airport.toJSON(),
      distance: parseFloat(r.distance)
    };
  }).filter(Boolean);
}

/**
 * Consulta el top 10 de aeropuertos más visitados desde el ZSET de Redis Popularidad.
 * Combina el contador de visitas con los datos del aeropuerto desde MongoDB.
 */
export async function getPopularAirports() {
  const popularResults = await redisPopClient.zRangeWithScores(
    'airport_popularity',
    0,
    9,
    { REV: true }
  );

  const iataCodes = popularResults.map(p => p.value);
  const airports = await Airport.find({ iata_faa: { $in: iataCodes } });
  const airportMap = new Map(airports.map(a => [a.iata_faa, a]));

  return popularResults.map(p => {
    const airport = airportMap.get(p.value);
    if (!airport) return null;
    return {
      ...airport.toJSON(),
      visits: p.score
    };
  }).filter(Boolean);
}
