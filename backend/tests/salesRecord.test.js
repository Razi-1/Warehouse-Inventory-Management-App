const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Product = require('../models/Product');

let mongoServer;
let adminToken;
let staffToken;
let productId;
let customerId;
let supplierId;
let warehouseId;
let salesRecordId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@sales-test.com', password: 'Admin@123', role: 'admin' });
  adminToken = adminRes.body.data.token;

  const staffRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Staff', email: 'staff@sales-test.com', password: 'Staff@123', role: 'staff' });
  staffToken = staffRes.body.data.token;

  // Set up required references
  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Sale Supplier', contactPerson: 'Sam', email: 'sam@supplier.com', phone: '+94774445566' });
  supplierId = supplierRes.body.data._id;

  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Sale Warehouse', address: '7 Commerce St', capacity: 500 });
  warehouseId = warehouseRes.body.data._id;

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Sale Product',
      sku: 'SAP-001',
      category: 'Electronics',
      price: 100,
      supplier: supplierId,
      warehouse: warehouseId,
    });
  productId = productRes.body.data._id;

  // Give the product 100 units via a stock entry
  await request(app)
    .post('/api/stock-entries')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      product: productId,
      warehouse: warehouseId,
      supplier: supplierId,
      quantityAdded: 100,
      dateReceived: new Date().toISOString(),
    });

  const customerRes = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Customer', email: 'cust@test.com', phone: '+94777788899' });
  customerId = customerRes.body.data._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('SalesRecord API', () => {
  it('should not allow staff to create a sales record (403)', async () => {
    const res = await request(app)
      .post('/api/sales-records')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        product: productId,
        customer: customerId,
        quantitySold: 5,
        unitPrice: 100,
        dateSold: new Date().toISOString(),
      });
    expect(res.statusCode).toBe(403);
  });

  it('should create a sales record and decrease product quantity', async () => {
    const res = await request(app)
      .post('/api/sales-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product: productId,
        customer: customerId,
        quantitySold: 10,
        unitPrice: 100,
        dateSold: new Date().toISOString(),
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.totalPrice).toBe(1000); // 10 * 100
    salesRecordId = res.body.data._id;

    const product = await Product.findById(productId);
    expect(product.quantity).toBe(90); // 100 - 10
  });

  it('should reject a sale with insufficient stock', async () => {
    const res = await request(app)
      .post('/api/sales-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product: productId,
        customer: customerId,
        quantitySold: 9999,
        unitPrice: 100,
        dateSold: new Date().toISOString(),
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get all sales records', async () => {
    const res = await request(app)
      .get('/api/sales-records')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should allow staff to get sales records', async () => {
    const res = await request(app)
      .get('/api/sales-records')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get a single sales record by ID', async () => {
    const res = await request(app)
      .get(`/api/sales-records/${salesRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(salesRecordId);
  });

  it('should return 404 for invalid sales record ID', async () => {
    const res = await request(app)
      .get('/api/sales-records/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a sales record and adjust product quantity by delta', async () => {
    const res = await request(app)
      .put(`/api/sales-records/${salesRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantitySold: 5 }); // was 10, delta = -5 (selling less, restore 5 to stock)
    expect(res.statusCode).toBe(200);

    const product = await Product.findById(productId);
    expect(product.quantity).toBe(95); // 90 + 5 restored
  });

  it('should delete a sales record and restore product quantity', async () => {
    const res = await request(app)
      .delete(`/api/sales-records/${salesRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const product = await Product.findById(productId);
    expect(product.quantity).toBe(100); // 95 + 5 restored
  });
});
