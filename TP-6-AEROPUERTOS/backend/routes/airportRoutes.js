import express from 'express';
import * as airportService from '../services/airportService.js';

const router = express.Router();

// GET /airports/nearby - Trae aeropuertos cercanos a un punto
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 100; // en km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Los parámetros "lat" y "lng" deben ser números válidos.' });
    }

    const results = await airportService.getNearbyAirports(lat, lng, radius);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar aeropuertos cercanos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /airports/popular - Devuelve e ranking de los mas visitados
router.get('/popular', async (req, res) => {
  try {
    const results = await airportService.getPopularAirports();
    res.json(results);
  } catch (error) {
    console.error('Error al obtener aeropuertos populares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /airports - devuelve  todos los aeropuertos
router.get('/', async (req, res) => {
  try {
    const airports = await airportService.getAllAirports();
    res.json(airports);
  } catch (error) {
    console.error('Error al obtener aeropuertos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /airports/:iata_code - Obtener detalles de un aeropuerto y sumar +1 visita
router.get('/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code;
    const airport = await airportService.getAirportByIata(iata);

    if (!airport) {
      return res.status(404).json({ error: 'Aeropuerto no encontrado.' });
    }

    res.json(airport);
  } catch (error) {
    console.error('Error al obtener detalles del aeropuerto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /airports - Crear un nuevo aeropuerto
router.post('/', async (req, res) => {
  try {
    const { name, city, iata_faa, lat, lng } = req.body;

    if (!name || !city || !iata_faa || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Los campos "name", "city", "iata_faa", "lat" y "lng" son obligatorios.' });
    }

    const newAirport = await airportService.createAirport(req.body);
    res.status(201).json(newAirport);
  } catch (error) {
    console.error('Error al crear el aeropuerto:', error);
    if (error.message.includes('ya existe')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /airports/:iata_code - Modificar un aeropuerto existente
router.put('/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code;
    const updatedAirport = await airportService.updateAirport(iata, req.body);

    if (!updatedAirport) {
      return res.status(404).json({ error: 'Aeropuerto no encontrado.' });
    }

    res.json(updatedAirport);
  } catch (error) {
    console.error('Error al modificar el aeropuerto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /airports/:iata_code - Eliminar un aeropuerto
router.delete('/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code;
    const deletedAirport = await airportService.deleteAirport(iata);

    if (!deletedAirport) {
      return res.status(404).json({ error: 'Aeropuerto no encontrado.' });
    }

    res.json({ message: `El aeropuerto con código IATA "${iata.toUpperCase()}" ha sido eliminado.` });
  } catch (error) {
    console.error('Error al eliminar el aeropuerto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
