import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  iata_faa: { type: String, required: true, unique: true, index: true },
  icao: { type: String, default: '' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  alt: { type: Number, default: 0 },
  tz: { type: String, default: '' }
});

const Airport = mongoose.model('Airport', airportSchema);

export default Airport;
