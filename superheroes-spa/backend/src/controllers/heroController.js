const Hero = require('../models/Hero');

exports.getAllHeroes = async (req, res, next) => {
  try {
    const heroes = await Hero.find().sort({ createdAt: -1 });
    res.json(heroes);
  } catch (err) {
    next(err);
  }
};

exports.getHeroById = async (req, res, next) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    res.json(hero);
  } catch (err) {
    next(err);
  }
};

exports.getHeroesByHouse = async (req, res, next) => {
  try {
    const houseAuth = req.params.house.toLowerCase() === 'marvel' ? 'Marvel' : 'DC';
    const heroes = await Hero.find({ house: houseAuth }).sort({ createdAt: -1 });
    res.json(heroes);
  } catch (err) {
    next(err);
  }
};

exports.createHero = async (req, res, next) => {
  try {
    const hero = new Hero(req.body);
    await hero.save();
    res.status(201).json(hero);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.updateHero = async (req, res, next) => {
  try {
    const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    res.json(hero);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.deleteHero = async (req, res, next) => {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    res.json({ message: 'Hero deleted successfully' });
  } catch (err) {
    next(err);
  }
};
