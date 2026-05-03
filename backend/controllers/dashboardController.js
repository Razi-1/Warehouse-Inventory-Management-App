const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Warehouse = require('../models/Warehouse');
const Customer = require('../models/Customer');
const StockEntry = require('../models/StockEntry');
const SalesRecord = require('../models/SalesRecord');

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    // Run all count queries in parallel for performance
    const [
      totalProducts,
      totalSuppliers,
      totalWarehouses,
      totalCustomers,
      totalStockEntries,
      totalSalesRecords,
      lowStockProducts,
      recentSales,
    ] = await Promise.all([
      Product.countDocuments(),
      Supplier.countDocuments(),
      Warehouse.countDocuments(),
      Customer.countDocuments(),
      StockEntry.countDocuments(),
      SalesRecord.countDocuments(),
      Product.find({ quantity: { $lte: 10 } }).select('name sku quantity').limit(20),
      SalesRecord.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: 'product', select: 'name sku' })
        .populate({ path: 'customer', select: 'name' }),
    ]);

    // Calculate total revenue by summing all totalPrice values
    const revenueResult = await SalesRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalSuppliers,
        totalWarehouses,
        totalCustomers,
        totalStockEntries,
        totalSalesRecords,
        totalRevenue,
        lowStockProducts,
        recentSales,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
