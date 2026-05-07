const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const heroesRoutes = require('./routes/heroes');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superheroesdb';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/heroes', heroesRoutes);

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    // don't exit if we fail initially, docker compose might start mongo slowly
    // process.exit(1);
  });
