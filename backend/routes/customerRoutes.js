// GITHUB: Day 3 - Commit 2 - "feat(backend): add Warehouse and Customer models and route stubs"

const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// GET: both admin and staff
router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomer);

// POST, PUT, DELETE: admin only
router.post('/', protect, authorize('admin'), upload.single('profileImage'), createCustomer);
router.put('/:id', protect, authorize('admin'), upload.single('profileImage'), updateCustomer);
router.delete('/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;
