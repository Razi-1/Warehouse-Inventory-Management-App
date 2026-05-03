const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Product = require('../models/Product');

let mongoServer;
let token;
let productId;
let supplierId;
let warehouseId;
let stockEntryId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const authRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@stock-test.com', password: 'Admin@123', role: 'admin' });
  token = authRes.body.data.token;

  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Stock Supplier', contactPerson: 'Sue', email: 'sue@supplier.com', phone: '+94771112233' });
  supplierId = supplierRes.body.data._id;

  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Stock Warehouse', address: '5 Storage Lane', capacity: 1000 });
  warehouseId = warehouseRes.body.data._id;

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Stock Product',
      sku: 'SP-001',
      category: 'Electronics',
      price: 10,
      supplier: supplierId,
      warehouse: warehouseId,
    });
  productId = productRes.body.data._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('StockEntry API', () => {
  it('should create a stock entry and increase product quantity', async () => {
    const res = await request(app)
      .post('/api/stock-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product: productId,
        warehouse: warehouseId,
        supplier: supplierId,
        quantityAdded: 50,
        dateReceived: new Date().toISOString(),
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    stockEntryId = res.body.data._id;

    // Verify product quantity increased
    const product = await Product.findById(productId);
    expect(product.quantity).toBe(50);
  });

  it('should get all stock entries', async () => {
    const res = await request(app)
      .get('/api/stock-entries')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a single stock entry by ID', async () => {
    const res = await request(app)
      .get(`/api/stock-entries/${stockEntryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(stockEntryId);
  });

  it('should return 404 for invalid stock entry ID', async () => {
    const res = await request(app)
      .get('/api/stock-entries/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a stock entry and apply quantity delta', async () => {
    const res = await request(app)
      .put(`/api/stock-entries/${stockEntryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantityAdded: 70 }); // was 50, delta = +20
    expect(res.statusCode).toBe(200);

    const product = await Product.findById(productId);
    expect(product.quantity).toBe(70); // 50 + 20 delta
  });

  it('should delete a stock entry and decrease product quantity', async () => {
    const res = await request(app)
      .delete(`/api/stock-entries/${stockEntryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    const product = await Product.findById(productId);
    expect(product.quantity).toBe(0); // 70 - 70, floored at 0
  });
});
