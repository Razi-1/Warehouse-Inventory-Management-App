// GITHUB: Day 2 - Commit 1 - "feat(backend): add Express server setup, MongoDB connection, and middleware"

// Load environment variables FIRST — before any require() that reads process.env
// (e.g. config/cloudinary.js needs CLOUDINARY_API_KEY at import time)
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const customerRoutes = require('./routes/customerRoutes');
const stockEntryRoutes = require('./routes/stockEntryRoutes');
const salesRecordRoutes = require('./routes/salesRecordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Connect to MongoDB only when not running tests
// (test files manage their own in-memory database connection)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock-entries', stockEntryRoutes);
app.use('/api/sales-records', salesRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'WarehouseIQ API is running' });
});

// Global error handler — must be the last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
