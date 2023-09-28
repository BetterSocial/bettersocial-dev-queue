const request = require('supertest');
const app = require('../../../src/app');

describe('GET /status-health/live', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/status-health/live');
    expect(response.statusCode).toBe(200);
  });
});
