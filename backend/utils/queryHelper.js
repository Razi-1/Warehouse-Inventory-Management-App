// queryHelper handles search, filter, sort, and pagination for all list endpoints.
// model: Mongoose model
// queryParams: req.query object
// searchFields: array of field names to search across (e.g. ['name', 'sku', 'description'])
// populateFields: array of field names to populate (e.g. ['supplier', 'warehouse'])
const queryHelper = async (model, queryParams, searchFields = [], populateFields = []) => {
  let query = {};

  // Search: build $or array to search across all specified text fields
  if (queryParams.search && queryParams.search.trim() !== '') {
    query.$or = searchFields.map((field) => ({
      [field]: { $regex: queryParams.search.trim(), $options: 'i' },
    }));
  }

  // Exact-match filters
  if (queryParams.category) {
    query.category = queryParams.category;
  }
  if (queryParams.supplier) {
    query.supplier = queryParams.supplier;
  }
  if (queryParams.warehouse) {
    query.warehouse = queryParams.warehouse;
  }
  if (queryParams.customer) {
    query.customer = queryParams.customer;
  }

  // Pagination
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 20;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = queryParams.sortBy || 'createdAt';
  const order = queryParams.order === 'asc' ? 1 : -1;

  // Build the query
  let dbQuery = model.find(query).sort({ [sortBy]: order }).skip(skip).limit(limit);

  // Populate referenced fields
  if (populateFields.length > 0) {
    populateFields.forEach((field) => {
      dbQuery = dbQuery.populate(field);
    });
  }

  const results = await dbQuery;
  const total = await model.countDocuments(query);

  return {
    data: results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

module.exports = queryHelper;
