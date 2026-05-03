const Customer = require('../models/Customer');
const SalesRecord = require('../models/SalesRecord');
const queryHelper = require('../utils/queryHelper');
const { uploadImageToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const result = await queryHelper(Customer, req.query, ['name', 'email', 'phone', 'address']);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private (admin only)
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const customerData = { name, email, phone, address };

    if (req.file) {
      customerData.profileImage = await uploadImageToCloudinary(req.file, 'warehouseiq-customers');
    }

    const customer = await Customer.create(customerData);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (admin only)
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, email, phone, address } = req.body;

    if (req.file) {
      if (customer.profileImage) await deleteFromCloudinary(customer.profileImage);
      customer.profileImage = await uploadImageToCloudinary(req.file, 'warehouseiq-customers');
    }

    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;

    const updatedCustomer = await customer.save();
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (admin only)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cascade = req.query.cascade === 'true';

    const salesCount = await SalesRecord.countDocuments({ customer: customer._id });

    if (salesCount > 0 && !cascade) {
      return res.status(409).json({
        success: false,
        hasReferences: true,
        message: `This customer has ${salesCount} sales record(s) linked to them.`,
        counts: { salesRecords: salesCount },
      });
    }

    if (cascade) {
      await SalesRecord.deleteMany({ customer: customer._id });
    }

    if (customer.profileImage) await deleteFromCloudinary(customer.profileImage);
    await customer.deleteOne();

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
