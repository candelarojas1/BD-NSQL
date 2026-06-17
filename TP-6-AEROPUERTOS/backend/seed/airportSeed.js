import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Airport from '../models/Airport.js';
import { redisGeoClient } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ejecuta el proceso de carga inicial de datos.
 * Lee el archivo airports.json, valida los registros e importa los datos
 * a MongoDB y agrega las coordenadas geográficas a Redis GEO.
 */
export async function runLoader() {
  try {
    const count = await Airport.countDocuments();
    if (count > 0) {
      console.log('La base de datos ya tiene datos. Se omite la carga inicial.');
      return;
    }

    console.log('Iniciando carga inicial de datos...');
    const airportsPath = path.join(__dirname, '..', 'airports.json');
    if (!fs.existsSync(airportsPath)) {
      console.error(`Archivo de datos no encontrado en ${airportsPath}`);
      return;
    }

    const rawData = fs.readFileSync(airportsPath, 'utf8');
    // Convertir el archivo a formato JSON válido (array de objetos)
    const formattedData = '[' + rawData.trim().replace(/\}\s*\{/g, '},{') + ']';
    const airports = JSON.parse(formattedData);

    const seenIata = new Set();
    const validAirports = [];

    for (const item of airports) {
      const iata = (item.iata_faa || '').trim().toUpperCase();
      // Omitir registros sin código IATA, duplicados o con coordenadas inválidas
      if (!iata || iata === '\\N' || seenIata.has(iata)) {
        continue;
      }
      if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
        continue;
      }
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
        continue;
      }
      if (!item.city || typeof item.city !== 'string' || !item.city.trim()) {
        continue;
      }
      seenIata.add(iata);
      validAirports.push({
        name: item.name.trim(),
        city: item.city.trim(),
        iata_faa: iata,
        icao: (item.icao || '').trim(),
        lat: item.lat,
        lng: item.lng,
        alt: item.alt || 0,
        tz: item.tz || ''
      });
    }

    if (validAirports.length > 0) {
      // Insertar en lote en MongoDB
      await Airport.insertMany(validAirports);
      console.log(`Se importaron ${validAirports.length} aeropuertos en MongoDB.`);

      // Insertar coordenadas en Redis GEO en lotes de 1000
      const geoMembers = validAirports.map(a => ({
        longitude: a.lng,
        latitude: a.lat,
        member: a.iata_faa
      }));

      const BATCH_SIZE = 1000;
      for (let i = 0; i < geoMembers.length; i += BATCH_SIZE) {
        const batch = geoMembers.slice(i, i + BATCH_SIZE);
        await redisGeoClient.geoAdd('airports-geo', batch);
      }
      console.log('Coordenadas agregadas correctamente a Redis GEO.');
    } else {
      console.log('No se encontraron aeropuertos válidos para importar.');
    }
  } catch (error) {
    console.error('Error durante la carga inicial de datos:', error);
  }
}
