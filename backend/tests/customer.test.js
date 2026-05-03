const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let adminToken;
let staffToken;
let customerId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@cust-test.com', password: 'Admin@123', role: 'admin' });
  adminToken = adminRes.body.data.token;

  const staffRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Staff', email: 'staff@cust-test.com', password: 'Staff@123', role: 'staff' });
  staffToken = staffRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Customer API', () => {
  const customerData = { name: 'Bob Builder', email: 'bob@build.com', phone: '+94779876543' };

  it('should create a customer as admin', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(customerData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    customerId = res.body.data._id;
  });

  it('should not create a customer as staff (403)', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(customerData);
    expect(res.statusCode).toBe(403);
  });

  it('should get all customers', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a single customer by ID', async () => {
    const res = await request(app)
      .get(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(customerId);
  });

  it('should return 404 for invalid customer ID', async () => {
    const res = await request(app)
      .get('/api/customers/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a customer', async () => {
    const res = await request(app)
      .put(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Robert Builder' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Robert Builder');
  });

  it('should delete a customer with no references', async () => {
    const res = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
