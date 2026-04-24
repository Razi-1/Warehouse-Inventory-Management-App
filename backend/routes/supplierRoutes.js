// GITHUB: Day 3 - Commit 1 - "feat(backend): add Product and Supplier models and route stubs"

const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Both admin and staff have full CRUD on suppliers
router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplier);
router.post('/', protect, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'contractDocument', maxCount: 1 }]), createSupplier);
router.put('/:id', protect, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'contractDocument', maxCount: 1 }]), updateSupplier);
router.delete('/:id', protect, deleteSupplier);

module.exports = router;
