const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const StockEntry = require('../models/StockEntry');
const SalesRecord = require('../models/SalesRecord');
const queryHelper = require('../utils/queryHelper');
const { uploadImageToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
const getWarehouses = async (req, res, next) => {
  try {
    const result = await queryHelper(Warehouse, req.query, ['name', 'address', 'description']);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single warehouse
// @route   GET /api/warehouses/:id
// @access  Private
const getWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.status(200).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a warehouse
// @route   POST /api/warehouses
// @access  Private (admin only — enforced by route middleware)
const createWarehouse = async (req, res, next) => {
  try {
    const { name, address, capacity, description } = req.body;
    const warehouseData = { name, address, capacity, description };

    if (req.file) {
      warehouseData.warehouseImage = await uploadImageToCloudinary(req.file, 'warehouseiq-warehouses');
    }

    const warehouse = await Warehouse.create(warehouseData);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (admin only)
const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const { name, address, capacity, description } = req.body;

    if (req.file) {
      if (warehouse.warehouseImage) await deleteFromCloudinary(warehouse.warehouseImage);
      warehouse.warehouseImage = await uploadImageToCloudinary(req.file, 'warehouseiq-warehouses');
    }

    if (name !== undefined) warehouse.name = name;
    if (address !== undefined) warehouse.address = address;
    if (capacity !== undefined) warehouse.capacity = capacity;
    if (description !== undefined) warehouse.description = description;

    const updatedWarehouse = await warehouse.save();
    res.status(200).json({ success: true, data: updatedWarehouse });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private (admin only)
const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const cascade = req.query.cascade === 'true';

    // Check for products referencing this warehouse
    const productCount = await Product.countDocuments({ warehouse: warehouse._id });

    if (productCount > 0 && !cascade) {
      return res.status(409).json({
        success: false,
        hasReferences: true,
        message: `This warehouse has ${productCount} product(s) stored in it. Deleting will also remove those products and all their related records.`,
        counts: { products: productCount },
      });
    }

    if (cascade) {
      const products = await Product.find({ warehouse: warehouse._id }).select('_id image');

      for (const product of products) {
        await StockEntry.deleteMany({ product: product._id });
        await SalesRecord.deleteMany({ product: product._id });
        if (product.image) await deleteFromCloudinary(product.image);
      }

      await Product.deleteMany({ warehouse: warehouse._id });
    }

    if (warehouse.warehouseImage) await deleteFromCloudinary(warehouse.warehouseImage);
    await warehouse.deleteOne();

    res.status(200).json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse };
