import request from 'supertest';
import app from '@main/config/app';

describe('Get Endpoints', () => {
  it('should be able to access last ranking route', async () => {
    const res = await request(app).get('/api/ranking/last');
    expect(res.status).toEqual(200);
  })
})
