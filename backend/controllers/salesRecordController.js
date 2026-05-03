const SalesRecord = require('../models/SalesRecord');
const Product = require('../models/Product');
const queryHelper = require('../utils/queryHelper');
const { uploadDocumentToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all sales records
// @route   GET /api/sales-records
// @access  Private
const getSalesRecords = async (req, res, next) => {
  try {
    const result = await queryHelper(
      SalesRecord,
      req.query,
      ['notes'],
      [
        { path: 'product', select: 'name sku' },
        { path: 'customer', select: 'name email' },
      ]
    );
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single sales record
// @route   GET /api/sales-records/:id
// @access  Private
const getSalesRecord = async (req, res, next) => {
  try {
    const salesRecord = await SalesRecord.findById(req.params.id)
      .populate({ path: 'product', select: 'name sku price quantity' })
      .populate({ path: 'customer', select: 'name email phone' });

    if (!salesRecord) {
      return res.status(404).json({ success: false, message: 'Sales record not found' });
    }

    res.status(200).json({ success: true, data: salesRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a sales record and decrease product quantity
// @route   POST /api/sales-records
// @access  Private (admin only)
const createSalesRecord = async (req, res, next) => {
  try {
    const { product: productId, customer, quantitySold, unitPrice, dateSold, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check sufficient stock
    if (product.quantity < Number(quantitySold)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, requested: ${quantitySold}.`,
      });
    }

    // Calculate totalPrice on the backend — never trust the client value
    const totalPrice = Number(quantitySold) * Number(unitPrice);

    const recordData = { product: productId, customer, quantitySold, unitPrice, totalPrice, dateSold, notes };

    if (req.file) {
      recordData.invoiceFile = await uploadDocumentToCloudinary(req.file, 'warehouseiq-sale-invoices');
    }

    const salesRecord = await SalesRecord.create(recordData);

    // Decrease product quantity
    product.quantity -= Number(quantitySold);
    await product.save();

    res.status(201).json({ success: true, data: salesRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sales record and recalculate product quantity using delta
// @route   PUT /api/sales-records/:id
// @access  Private (admin only)
const updateSalesRecord = async (req, res, next) => {
  try {
    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({ success: false, message: 'Sales record not found' });
    }

    const { quantitySold, unitPrice, customer, dateSold, notes } = req.body;

    // Handle quantity change: use delta to adjust product stock
    if (quantitySold !== undefined && Number(quantitySold) !== salesRecord.quantitySold) {
      const product = await Product.findById(salesRecord.product);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Associated product not found' });
      }

      const oldQuantity = salesRecord.quantitySold;
      const newQuantity = Number(quantitySold);
      const delta = newQuantity - oldQuantity;

      if (delta > 0) {
        // Selling more — check sufficient stock for the additional amount
        if (product.quantity < delta) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for the increase. Available: ${product.quantity}, additional needed: ${delta}.`,
          });
        }
        product.quantity -= delta;
      } else if (delta < 0) {
        // Selling less — restore the difference to stock
        product.quantity += Math.abs(delta);
      }

      await product.save();
      salesRecord.quantitySold = newQuantity;
    }

    // Recalculate totalPrice
    const finalQuantity = salesRecord.quantitySold;
    const finalUnitPrice = unitPrice !== undefined ? Number(unitPrice) : salesRecord.unitPrice;
    salesRecord.totalPrice = finalQuantity * finalUnitPrice;

    if (req.file) {
      if (salesRecord.invoiceFile) await deleteFromCloudinary(salesRecord.invoiceFile);
      salesRecord.invoiceFile = await uploadDocumentToCloudinary(req.file, 'warehouseiq-sale-invoices');
    }

    if (unitPrice !== undefined) salesRecord.unitPrice = Number(unitPrice);
    if (customer !== undefined) salesRecord.customer = customer;
    if (dateSold !== undefined) salesRecord.dateSold = dateSold;
    if (notes !== undefined) salesRecord.notes = notes;

    const updatedRecord = await salesRecord.save();
    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sales record and restore product quantity
// @route   DELETE /api/sales-records/:id
// @access  Private (admin only)
const deleteSalesRecord = async (req, res, next) => {
  try {
    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({ success: false, message: 'Sales record not found' });
    }

    // Restore quantity to the product
    const product = await Product.findById(salesRecord.product);
    if (product) {
      product.quantity += salesRecord.quantitySold;
      await product.save();
    }

    if (salesRecord.invoiceFile) await deleteFromCloudinary(salesRecord.invoiceFile);
    await salesRecord.deleteOne();

    res.status(200).json({ success: true, message: 'Sales record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesRecords, getSalesRecord, createSalesRecord, updateSalesRecord, deleteSalesRecord };
