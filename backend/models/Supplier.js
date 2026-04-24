// GITHUB: Day 3 - Commit 1 - "feat(backend): add Product and Supplier models and route stubs"

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
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
  logo: {
    type: String, // Cloudinary URL (optional)
  },
  contractDocument: {
    type: String, // Cloudinary URL (optional)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Supplier', supplierSchema);
