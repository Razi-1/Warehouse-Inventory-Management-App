// GITHUB: Day 4 - Commit 1 - "feat(backend): add Product, Supplier, and Warehouse controllers with full CRUD"

const Product = require('../models/Product');
const StockEntry = require('../models/StockEntry');
const SalesRecord = require('../models/SalesRecord');
const queryHelper = require('../utils/queryHelper');
const { uploadImageToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const result = await queryHelper(
      Product,
      req.query,
      ['name', 'sku', 'description', 'category'],
      [
        { path: 'supplier', select: 'name' },
        { path: 'warehouse', select: 'name' },
      ]
    );

    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: 'supplier', select: 'name contactPerson email' })
      .populate({ path: 'warehouse', select: 'name address' });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { name, description, sku, category, supplier, warehouse, price } = req.body;

    const productData = { name, description, sku, category, supplier, warehouse, price };

    // Upload image to Cloudinary if one was provided
    if (req.file) {
      const imageUrl = await uploadImageToCloudinary(req.file, 'warehouseiq-products');
      productData.image = imageUrl;
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, description, sku, category, supplier, warehouse, price } = req.body;

    // If a new image was uploaded, delete the old one from Cloudinary first
    if (req.file) {
      if (product.image) {
        await deleteFromCloudinary(product.image);
      }
      const imageUrl = await uploadImageToCloudinary(req.file, 'warehouseiq-products');
      product.image = imageUrl;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (sku !== undefined) product.sku = sku;
    if (category !== undefined) product.category = category;
    if (supplier !== undefined) product.supplier = supplier;
    if (warehouse !== undefined) product.warehouse = warehouse;
    if (price !== undefined) product.price = price;

    const updatedProduct = await product.save();

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cascade = req.query.cascade === 'true';

    // Check for dependent references
    const stockEntryCount = await StockEntry.countDocuments({ product: product._id });
    const salesRecordCount = await SalesRecord.countDocuments({ product: product._id });
    const totalReferences = stockEntryCount + salesRecordCount;

    if (totalReferences > 0 && !cascade) {
      return res.status(409).json({
        success: false,
        hasReferences: true,
        message: `This product has linked records that will also be deleted.`,
        counts: {
          stockEntries: stockEntryCount,
          salesRecords: salesRecordCount,
        },
      });
    }

    if (cascade) {
      // Delete all linked stock entries and sales records
      await StockEntry.deleteMany({ product: product._id });
      await SalesRecord.deleteMany({ product: product._id });
    }

    // Delete image from Cloudinary
    if (product.image) {
      await deleteFromCloudinary(product.image);
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
