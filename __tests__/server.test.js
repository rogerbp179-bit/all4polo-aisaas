const request = require('supertest');
const app = require('../src/server');

describe('Server', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /add returns sum', async () => {
    const res = await request(app).get('/add').query({ a: 3, b: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ result: 7 });
  });
});
