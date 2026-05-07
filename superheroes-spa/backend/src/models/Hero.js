const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  realName: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    required: true
  },
  house: {
    type: String,
    required: true,
    enum: ['Marvel', 'DC']
  },
  biography: {
    type: String,
    required: true
  },
  equipment: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one image URL is required.']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hero', heroSchema);
