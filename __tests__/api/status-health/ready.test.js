const request = require('supertest');
const statusHealthService = require('../../../src/services/status-health.service');
const app = require('../../../src/app');

jest.mock('../../../src/services/status-health.service', () => ({
  isReady: jest.fn()
}));

describe('GET /status-health/ready', () => {
  afterEach(() => {
    statusHealthService.isReady.mockReset();
  });

  it('status-health check: ready should return 200 OK', async () => {
    statusHealthService.isReady.mockResolvedValue(true);

    const response = await request(app).get('/status-health/ready');
    expect(response.statusCode).toBe(200);
  });

  it('status-health check: not ready should return 503 with Service unavailable response', async () => {
    statusHealthService.isReady.mockResolvedValue(false);

    const response = await request(app).get('/status-health/ready');
    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({message: 'Service unavailable'});
  });
});
