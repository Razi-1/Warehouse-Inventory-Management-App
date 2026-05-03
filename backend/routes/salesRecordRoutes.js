const express = require('express');
const router = express.Router();
const {
  getSalesRecords,
  getSalesRecord,
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
} = require('../controllers/salesRecordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// GET: both admin and staff
router.get('/', protect, getSalesRecords);
router.get('/:id', protect, getSalesRecord);

// POST, PUT, DELETE: admin only
router.post('/', protect, authorize('admin'), upload.single('invoiceFile'), createSalesRecord);
router.put('/:id', protect, authorize('admin'), upload.single('invoiceFile'), updateSalesRecord);
router.delete('/:id', protect, authorize('admin'), deleteSalesRecord);

module.exports = router;
