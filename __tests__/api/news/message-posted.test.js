const request = require('supertest');
const {newsQueue} = require('../../../src/config');
const utils = require('../../../src/utils');

const spyCheckIfValidURL = jest.spyOn(utils, 'checkIfValidURL');
const app = require('../../../src/app');

afterEach(() => {
  spyCheckIfValidURL.mockRestore();
});

describe('POST /api/v1/news/message-posted', () => {
  it('valid url should return 200 OK', async () => {
    // mock
    newsQueue.add.mockResolvedValue({id: '1234'});
    spyCheckIfValidURL.mockReturnValue('valid url');

    const payload = [
      {
        new: [{message: 'valid url', id: '', actor: {id: ''}, topics: [], duration_feed: ''}]
      }
    ];
    const res = await request(app).post('/api/v1/news/message-posted').send(payload);

    expect(spyCheckIfValidURL).toHaveBeenCalled();
    expect(newsQueue.add).toHaveBeenCalledWith(
      {
        body: payload[0].new[0].message,
        id_feed: payload[0].new[0].id || false,
        user_id: payload[0].new[0].actor.id || false,
        topics: payload[0].new[0].topics,
        duration_feed: payload[0].new[0].duration_feed
      },
      {
        jobId: expect.any(String),
        removeOnComplete: true
      }
    );
    expect(res.statusCode).toBe(200);
  });
});
