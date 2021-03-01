import request from 'supertest';

import { SingletonFactory } from '@utils/factory';
import factories from '@infra/factories';
import { ServerBuilder } from '@infra/server';

import {
  FakeExternalPriceRepository,
  FakePriceRepository, FakeUserRepository
} from '@mock/data-source/repositories';

let app: ServerBuilder['app'];

// TODO: adapt this to graphql.spec.ts
describe('GraphQL', () => {
  beforeAll(async done => {
    const builder = new ServerBuilder().withGraphQL();
    const repositories = {
      prices: new SingletonFactory(() => ({
        internal: new FakePriceRepository(),
        externals: [new FakeExternalPriceRepository()],
      })),
      users: new SingletonFactory(() => new FakeUserRepository()),
    };
    jest.spyOn(factories, 'ofRepositories')
      .mockReturnValue(Promise.resolve(repositories));
    app = builder.app;
    builder.build().then(() => done(), done);
  });

  it('should be able to post symbol when logged in as admin', async (done) => {
    const security = (await factories.ofSecurity()).make();
    jest.spyOn(security, 'verifyToken').mockImplementationOnce(token => {
      if (token === 'validToken')
        return {
          role: 'ADMIN',
        };
      return {};
    });
    request(app)
      .post('/graphql')
      .set('Authorization', 'Token validToken')
      .send({
        query: `mutation {
          symbolRegister(ticker: "ITUB3", symbols: [{
            source: "external source",
            symbol: "ITUB3.SAO"
          }])
        }`
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.symbolRegister).toBeInstanceOf(Array);
        expect(res.body.data.symbolRegister.length).toBe(1);
        done();
      });
  });

  it('should not be able to post symbol when logged in as user', async (done) => {
    const security = (await factories.ofSecurity()).make();
    jest.spyOn(security, 'verifyToken').mockImplementationOnce(token => {
      if (token === 'validToken')
        return {
          role: 'USER',
        };
      return {};
    });
    request(app)
      .post('/graphql')
      .set('Authorization', 'Token validToken')
      .send({
        query: `mutation {
          symbolRegister(ticker: "ITUB3", symbols: [{
            source: "external source",
            symbol: "ITUB3.SAO"
          }])
        }`
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.symbolRegister.message).toEqual('Admin privilegies required to this action!');
        done();
      });
  });

  it('should be able to search ITUB3 symbol', async (done) => {
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
        expect(res.body.data.symbolSearch['external source']['ITUB3.SAO']).toBeInstanceOf(Object);
        done();
      });
  });

  it('should be able to access ITUB4 last price', async (done) => {
    request(app)
      .post('/graphql')
      .send({
        query: `{
          lastPrice(ticker: "ITUB4") {
            ticker, name, date, open, close, min, max
          }
        }`
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.lastPrice).toBeInstanceOf(Object);
        expect(Object.keys(res.body.data.lastPrice)).toEqual([
          'ticker', 'name', 'date', 'open', 'close', 'min', 'max'
        ]);
        done();
      });
  });
});
