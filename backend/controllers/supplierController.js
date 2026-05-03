const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const StockEntry = require('../models/StockEntry');
const SalesRecord = require('../models/SalesRecord');
const queryHelper = require('../utils/queryHelper');
const { uploadImageToCloudinary, uploadDocumentToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const result = await queryHelper(Supplier, req.query, ['name', 'contactPerson', 'email', 'phone']);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplierData = { name, contactPerson, email, phone, address };

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        supplierData.logo = await uploadImageToCloudinary(req.files.logo[0], 'warehouseiq-suppliers');
      }
      if (req.files.contractDocument && req.files.contractDocument[0]) {
        supplierData.contractDocument = await uploadDocumentToCloudinary(
          req.files.contractDocument[0],
          'warehouseiq-supplier-docs'
        );
      }
    }

    const supplier = await Supplier.create(supplierData);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { name, contactPerson, email, phone, address } = req.body;

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        if (supplier.logo) await deleteFromCloudinary(supplier.logo);
        supplier.logo = await uploadImageToCloudinary(req.files.logo[0], 'warehouseiq-suppliers');
      }
      if (req.files.contractDocument && req.files.contractDocument[0]) {
        if (supplier.contractDocument) await deleteFromCloudinary(supplier.contractDocument);
        supplier.contractDocument = await uploadDocumentToCloudinary(
          req.files.contractDocument[0],
          'warehouseiq-supplier-docs'
        );
      }
    }

    if (name !== undefined) supplier.name = name;
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;

    const updatedSupplier = await supplier.save();
    res.status(200).json({ success: true, data: updatedSupplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const cascade = req.query.cascade === 'true';

    // Check for products referencing this supplier
    const productCount = await Product.countDocuments({ supplier: supplier._id });

    if (productCount > 0 && !cascade) {
      return res.status(409).json({
        success: false,
        hasReferences: true,
        message: `This supplier has ${productCount} product(s) linked to it. Deleting will also remove those products and all their related records.`,
        counts: { products: productCount },
      });
    }

    if (cascade) {
      // Find all products for this supplier
      const products = await Product.find({ supplier: supplier._id }).select('_id image');

      for (const product of products) {
        // Delete stock entries and sales records for each product
        await StockEntry.deleteMany({ product: product._id });
        await SalesRecord.deleteMany({ product: product._id });

        // Delete product image from Cloudinary
        if (product.image) await deleteFromCloudinary(product.image);
      }

      // Delete all products for this supplier
      await Product.deleteMany({ supplier: supplier._id });
    }

    // Delete supplier files from Cloudinary
    if (supplier.logo) await deleteFromCloudinary(supplier.logo);
    if (supplier.contractDocument) await deleteFromCloudinary(supplier.contractDocument);

    await supplier.deleteOne();

    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
