const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');

// GET all outfits
router.get('/outfits', async (req, res) => {
  try {
    const outfits = await Outfit.find({}).sort({ createdAt: -1 });
    res.json(outfits);
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({ error: 'Failed to fetch outfits' });
  }
});

// GET outfit by ID
router.get('/outfits/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    res.json(outfit);
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// POST new outfit
router.post('/outfits', async (req, res) => {
  try {
    const { name, price, description, color, top_url, bottom_url } = req.body;
    
    const newOutfit = new Outfit({
      name,
      price,
      description,
      color,
      top_url,
      bottom_url
    });
    
    const savedOutfit = await newOutfit.save();
    res.status(201).json(savedOutfit);
  } catch (error) {
    console.error('Error creating outfit:', error);
    res.status(500).json({ error: 'Failed to create outfit' });
  }
});

module.exports = router; 