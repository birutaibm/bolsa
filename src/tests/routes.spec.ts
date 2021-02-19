import request from 'supertest';
import app from '@infra/server';

describe('API', () => {
  it('should be able to create user', async (done) => {
    request(app)
      .post('/api/users')
      .send({
        userName: 'meu usuário',
        password: 'minha senha',
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.userName).toBe('meu usuário');
        expect(res.body.role).toBe('USER');
        expect(Object.keys(res.body).length).toBe(2);
        done();
      });
  });

  it('should be able to sign-in', async (done) => {
    request(app)
      .post('/api/users')
      .send({
        userName: 'eu mesmo',
        password: 'minha senha',
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.userName).toBe('eu mesmo');
        expect(res.body.role).toBe('USER');
        expect(Object.keys(res.body).length).toBe(2);
        request(app)
          .post('/api/sessions')
          .send({
            userName: 'eu mesmo',
            password: 'minha senha',
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).toBeInstanceOf(Object);
            expect(typeof res.body.token).toBe('string');
            expect(Object.keys(res.body).length).toBe(1);
            done();
          });
      });
  });

  it('should be able to access ITUB3 symbol route', async (done) => {
    const response = await request(app).get('/api/symbols/ITUB3');
    expect(response.status).toBe(200);
    done();
  });

  it('should be able to search ITUB3 via graphQL route', async (done) => {
    request(app)
      .post('/graphql')
      .send({
        query: `{
          symbolSearch(ticker: "ITUB3")
        }`
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.symbolSearch).toBeInstanceOf(Object);
        expect(res.body.data.symbolSearch['alphavantage']['ITUB3.SAO']).toBeInstanceOf(Object);
        done();
      });
  });

  // it('should be able to access ITUB4 last price route', async (done) => {
  //   const res = await request(app).get('/api/price/last/ITUB4');
  //   expect(res.status).toEqual(200);
  //   done();
  // });
});
