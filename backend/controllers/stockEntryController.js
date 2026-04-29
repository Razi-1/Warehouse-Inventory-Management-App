const StockEntry = require('../models/StockEntry');
const Product = require('../models/Product');
const queryHelper = require('../utils/queryHelper');
const { uploadImageToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all stock entries
// @route   GET /api/stock-entries
// @access  Private
const getStockEntries = async (req, res, next) => {
  try {
    const result = await queryHelper(
      StockEntry,
      req.query,
      ['notes'],
      [
        { path: 'product', select: 'name sku' },
        { path: 'warehouse', select: 'name' },
        { path: 'supplier', select: 'name' },
      ]
    );
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single stock entry
// @route   GET /api/stock-entries/:id
// @access  Private
const getStockEntry = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findById(req.params.id)
      .populate({ path: 'product', select: 'name sku price quantity' })
      .populate({ path: 'warehouse', select: 'name address' })
      .populate({ path: 'supplier', select: 'name contactPerson email' });

    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    res.status(200).json({ success: true, data: stockEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a stock entry and increase product quantity
// @route   POST /api/stock-entries
// @access  Private
const createStockEntry = async (req, res, next) => {
  try {
    const { product: productId, warehouse, supplier, quantityAdded, dateReceived, notes } = req.body;

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const entryData = { product: productId, warehouse, supplier, quantityAdded, dateReceived, notes };

    if (req.file) {
      entryData.invoiceImage = await uploadImageToCloudinary(req.file, 'warehouseiq-invoices');
    }

    const stockEntry = await StockEntry.create(entryData);

    // Increase product quantity by the amount added
    product.quantity += Number(quantityAdded);
    await product.save();

    res.status(201).json({ success: true, data: stockEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a stock entry and recalculate product quantity using delta
// @route   PUT /api/stock-entries/:id
// @access  Private
const updateStockEntry = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findById(req.params.id);
    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    const { quantityAdded, warehouse, supplier, dateReceived, notes } = req.body;

    // Handle quantity change: calculate delta and apply to product quantity
    if (quantityAdded !== undefined && Number(quantityAdded) !== stockEntry.quantityAdded) {
      const product = await Product.findById(stockEntry.product);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Associated product not found' });
      }

      const oldQuantity = stockEntry.quantityAdded;
      const newQuantity = Number(quantityAdded);
      const delta = newQuantity - oldQuantity;

      // Ensure the product quantity would not go below 0
      if (product.quantity + delta < 0) {
        return res.status(400).json({
          success: false,
          message: `Update would result in negative stock. Current product stock: ${product.quantity}, delta: ${delta}.`,
        });
      }

      product.quantity += delta;
      await product.save();
      stockEntry.quantityAdded = newQuantity;
    }

    // Handle invoice image replacement
    if (req.file) {
      if (stockEntry.invoiceImage) await deleteFromCloudinary(stockEntry.invoiceImage);
      stockEntry.invoiceImage = await uploadImageToCloudinary(req.file, 'warehouseiq-invoices');
    }

    if (warehouse !== undefined) stockEntry.warehouse = warehouse;
    if (supplier !== undefined) stockEntry.supplier = supplier;
    if (dateReceived !== undefined) stockEntry.dateReceived = dateReceived;
    if (notes !== undefined) stockEntry.notes = notes;

    const updatedEntry = await stockEntry.save();
    res.status(200).json({ success: true, data: updatedEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stock entry and decrease product quantity
// @route   DELETE /api/stock-entries/:id
// @access  Private
const deleteStockEntry = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findById(req.params.id);
    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    // Decrease product quantity — but floor at 0, never allow negative
    const product = await Product.findById(stockEntry.product);
    if (product) {
      const newQuantity = product.quantity - stockEntry.quantityAdded;
      product.quantity = Math.max(0, newQuantity);
      await product.save();
    }

    if (stockEntry.invoiceImage) await deleteFromCloudinary(stockEntry.invoiceImage);
    await stockEntry.deleteOne();

    res.status(200).json({ success: true, message: 'Stock entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStockEntries, getStockEntry, createStockEntry, updateStockEntry, deleteStockEntry };
