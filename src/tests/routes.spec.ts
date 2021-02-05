import request from 'supertest';
import app from '@infra/server';

describe('Get Endpoints', () => {
  it('should be able to access last ranking route', async (done) => {
    const res = await request(app).get('/api/ranking/last');
    expect(res.status).toEqual(200);
    done();
  });

  it('should be able to access ITUB3 symbol route', async (done) => {
    const res = await request(app).get('/api/symbols/ITUB3');
    expect(res.status).toEqual(200);
    done();
  });

  // it('should be able to access ITUB4 last price route', async (done) => {
  //   const res = await request(app).get('/api/price/last/ITUB4');
  //   expect(res.status).toEqual(200);
  //   done();
  // });

  it('should be able to access graphql route', async (done) => {
    request(app)
      .post('/graphql')
      .send({
        query: `{
          lastRanking {
            player {
              name
            }
            score
            heroes {
              name
            }
          }
        }`
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.lastRanking.length).toEqual(1);
        expect(res.body.data.lastRanking[0].heroes.length).toEqual(3);
        done();
      });
  });
});
