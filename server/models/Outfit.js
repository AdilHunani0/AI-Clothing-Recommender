const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  outfit_id: { type: Number, required: true },
  top: {
    name: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    image_url: { type: String, required: true }
  },
  bottom: {
    name: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    image_url: { type: String, required: true }
  },
  occasion: { type: String, required: true },
  description: { type: String, required: true },
  total_price: { type: Number, required: true },
  review: { type: Number, default: 0 },
  tags: [{ type: String }]
});

module.exports = mongoose.model('Outfit', outfitSchema);