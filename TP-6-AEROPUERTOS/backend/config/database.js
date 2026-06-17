import mongoose from 'mongoose';
import { createClient } from 'redis';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airport_db';
const REDIS_GEO_URL = process.env.REDIS_GEO_URL || 'redis://localhost:6379';
const REDIS_POP_URL = process.env.REDIS_POP_URL || 'redis://localhost:6380';

// Crear clientes de Redis
export const redisGeoClient = createClient({ url: REDIS_GEO_URL });
export const redisPopClient = createClient({ url: REDIS_POP_URL });

redisGeoClient.on('error', (err) => console.error('Error en cliente Redis GEO:', err));
redisPopClient.on('error', (err) => console.error('Error en cliente Redis Popularidad:', err));

/**
 * Conecta a MongoDB y a los dos clientes de Redis.
 */
export async function connectDatabases() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB.');

  console.log('Conectando a Redis GEO...');
  await redisGeoClient.connect();
  console.log('Conectado a Redis GEO.');

  console.log('Conectando a Redis Popularidad...');
  await redisPopClient.connect();
  console.log('Conectado a Redis Popularidad.');
}
