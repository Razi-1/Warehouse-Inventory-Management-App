// GITHUB: Day 3 - Commit 1 - "feat(backend): add Product and Supplier models and route stubs"

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All product routes require authentication
// Both admin and staff have full CRUD on products
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, upload.single('image'), createProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
