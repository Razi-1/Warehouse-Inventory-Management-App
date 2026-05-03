const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let adminToken;
let staffToken;
let warehouseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@wh-test.com', password: 'Admin@123', role: 'admin' });
  adminToken = adminRes.body.data.token;

  const staffRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Staff', email: 'staff@wh-test.com', password: 'Staff@123', role: 'staff' });
  staffToken = staffRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Warehouse API', () => {
  const warehouseData = { name: 'Main Warehouse', address: '1 Logistics Park', capacity: 1000 };

  it('should create a warehouse as admin', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(warehouseData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    warehouseId = res.body.data._id;
  });

  it('should not create a warehouse as staff (403)', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(warehouseData);
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow staff to get all warehouses', async () => {
    const res = await request(app)
      .get('/api/warehouses')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get a single warehouse by ID', async () => {
    const res = await request(app)
      .get(`/api/warehouses/${warehouseId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(warehouseId);
  });

  it('should return 404 for invalid warehouse ID', async () => {
    const res = await request(app)
      .get('/api/warehouses/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a warehouse as admin', async () => {
    const res = await request(app)
      .put(`/api/warehouses/${warehouseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 2000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.capacity).toBe(2000);
  });

  it('should delete a warehouse as admin', async () => {
    const res = await request(app)
      .delete(`/api/warehouses/${warehouseId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
