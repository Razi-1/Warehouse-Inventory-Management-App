const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let token;
let supplierId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const authRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Admin', email: 'admin@supplier-test.com', password: 'Admin@123', role: 'admin' });
  token = authRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Supplier API', () => {
  const supplierData = {
    name: 'ACME Corp',
    contactPerson: 'John Smith',
    email: 'john@acme.com',
    phone: '+94771234567',
    address: '100 ACME Way',
  };

  it('should create a new supplier', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('ACME Corp');
    supplierId = res.body.data._id;
  });

  it('should not create a supplier with missing required fields', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Supplier' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get all suppliers', async () => {
    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a single supplier by ID', async () => {
    const res = await request(app)
      .get(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(supplierId);
  });

  it('should return 404 for an invalid supplier ID', async () => {
    const res = await request(app)
      .get('/api/suppliers/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should update a supplier', async () => {
    const res = await request(app)
      .put(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ACME Corporation', phone: '+94779998877' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('ACME Corporation');
  });

  it('should delete a supplier with no references', async () => {
    const res = await request(app)
      .delete(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
