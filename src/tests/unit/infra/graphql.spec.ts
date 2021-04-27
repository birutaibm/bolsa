import request from 'supertest';

import { ServerBuilder } from '@infra/server';

import { mockedServerBuilder } from '@mock/factories';
import {
  assets, externalSourceName, externalSourceSymbols
} from '@mock/data-source/repositories/price-data';

let app: ServerBuilder['app'];

describe('GraphQL', () => {
  beforeAll(async done => {
    const builder = mockedServerBuilder()
      .withGraphQL();
    app = builder.app;
    try {
      builder.build();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to post symbol when logged in as admin', async (done) => {
    const ticker = Object.keys(externalSourceSymbols)[0];
    const symbol = Object.keys(externalSourceSymbols[ticker])[0];
    const query = `mutation {
      symbolRegister(ticker: "${ticker}", symbols: [{
        source: "${externalSourceName}",
        symbol: "${symbol}"
      }])
    }`;
    console.log(query);
    request(app)
      .post('/graphql')
      .set('Authorization', 'Token adminToken')
      .send({ query })
      .set("Accept", "application/json charset=utf-8")
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
    const ticker = Object.keys(externalSourceSymbols)[0];
    const symbol = Object.keys(externalSourceSymbols[ticker])[0];
    const query = `mutation {
      symbolRegister(ticker: "${ticker}", symbols: [{
        source: "${externalSourceName}",
        symbol: "${symbol}"
      }])
    }`;
    request(app)
      .post('/graphql')
      .set('Authorization', 'Token userToken')
      .send({ query })
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.symbolRegister.message).toEqual('Admin privilegies required to this action!');
        done();
      });
  });

  it('should be able to search symbol', async (done) => {
    const ticker = Object.keys(externalSourceSymbols)[0];
    const symbol = Object.keys(externalSourceSymbols[ticker])[0];
    request(app)
      .post('/graphql')
      .send({
        query: `{
          symbolSearch(ticker: "${ticker}")
        }`
      })
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.symbolSearch).toBeInstanceOf(Object);
        expect(res.body.data.symbolSearch[externalSourceName][symbol]).toBeInstanceOf(Object);
        done();
      });
  });

  it('should be able to access ITUB4 last price', async (done) => {
    request(app)
      .post('/graphql')
      .send({
        query: `{
          lastPrice(ticker: "${assets[0].ticker}") {
            ticker, name, date, open, close, min, max
          }
        }`
      })
      .set("Accept", "application/json charset=utf-8")
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
