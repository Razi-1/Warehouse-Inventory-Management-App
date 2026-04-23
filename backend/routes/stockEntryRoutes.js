const express = require('express');
const router = express.Router();
const {
  getStockEntries,
  getStockEntry,
  createStockEntry,
  updateStockEntry,
  deleteStockEntry,
} = require('../controllers/stockEntryController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Both admin and staff have full CRUD on stock entries
router.get('/', protect, getStockEntries);
router.get('/:id', protect, getStockEntry);
router.post('/', protect, upload.single('invoiceImage'), createStockEntry);
router.put('/:id', protect, upload.single('invoiceImage'), updateStockEntry);
router.delete('/:id', protect, deleteStockEntry);

module.exports = router;
