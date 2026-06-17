import express from 'express';
import cors from 'cors';
import { connectDatabases } from './config/database.js';
import { runLoader } from './seed/airportSeed.js';
import airportRoutes from './routes/airportRoutes.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Registrar las rutas de aeropuertos
app.use('/airports', airportRoutes);

async function startServer() {
  try {
    // 1. Establecer conexiones a las bases de datos
    await connectDatabases();

    // 2. Ejecutar el proceso de carga inicial (solo si la BD está vacía)
    await runLoader();

    // 3. Iniciar el servidor y comenzar a escuchar peticiones
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();
