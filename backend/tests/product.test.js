const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let token;
let productId;
let supplierId;
let warehouseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register admin and get token
  const authRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Admin', email: 'admin@product-test.com', password: 'Admin@123', role: 'admin' });
  token = authRes.body.data.token;

  // Create a supplier for product tests
  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Supplier',
      contactPerson: 'Jane Doe',
      email: 'supplier@test.com',
      phone: '+94771234567',
    });
  supplierId = supplierRes.body.data._id;

  // Create a warehouse for product tests
  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Warehouse', address: '123 Test St', capacity: 500 });
  warehouseId = warehouseRes.body.data._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product API', () => {
  const productData = () => ({
    name: 'Test Widget',
    sku: 'TW-001',
    category: 'Electronics',
    price: 29.99,
    supplier: supplierId,
    warehouse: warehouseId,
  });

  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData());
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Widget');
    expect(res.body.data.quantity).toBe(0);
    productId = res.body.data._id;
  });

  it('should not create a product with missing required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Product' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('should get a single product by ID', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(productId);
  });

  it('should return 404 for an invalid product ID', async () => {
    const res = await request(app)
      .get('/api/products/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Widget', price: 39.99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Widget');
    expect(res.body.data.price).toBe(39.99);
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
