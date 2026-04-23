// GITHUB: Day 3 - Commit 2 - "feat(backend): add Warehouse and Customer models and route stubs"

const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  description: {
    type: String,
    trim: true,
  },
  warehouseImage: {
    type: String, // Cloudinary URL (optional)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
