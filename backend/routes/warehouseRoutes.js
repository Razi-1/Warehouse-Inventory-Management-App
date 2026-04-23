// GITHUB: Day 3 - Commit 2 - "feat(backend): add Warehouse and Customer models and route stubs"

const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require('../controllers/warehouseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// GET: both admin and staff
router.get('/', protect, getWarehouses);
router.get('/:id', protect, getWarehouse);

// POST, PUT, DELETE: admin only
router.post('/', protect, authorize('admin'), upload.single('warehouseImage'), createWarehouse);
router.put('/:id', protect, authorize('admin'), upload.single('warehouseImage'), updateWarehouse);
router.delete('/:id', protect, authorize('admin'), deleteWarehouse);

module.exports = router;
