// GITHUB: Day 3 - Commit 2 - "feat(backend): add Warehouse and Customer models and route stubs"

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function (v) {
        return /^\+94\d{9}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'Phone must be a valid Sri Lankan number (e.g. +94 77 123 4567)',
    },
  },
  address: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String, // Cloudinary URL (optional)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
