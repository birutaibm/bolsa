import request from 'supertest';
import { datatype, date, finance, internet, name as user } from 'faker';

import { AssetData } from '@gateway/data/contracts';

import { Asset } from '@infra/data-source/model';
import { Factories } from '@infra/factories';
import { Server, ServerBuilder } from '@infra/server';

import {
  investors, wallets, positions, operations
} from '@mock/data-source/repositories/wallet-module-data';
import {
  assets, externalSourceName, externalSourceSymbols
} from '@mock/data-source/repositories/price-data';
import { mockedServerBuilder } from '@mock/factories';
import { users } from '@mock/data-source/repositories/users-data';

let symbol: string;
let investorId: string;
let walletId: string;
let investorName: string;
let walletName: string;
let positionId: string;
let positionAsset: AssetData;
let operationId: string;
let asset: Asset;
let value: number;
let quantity: number;
let app: ServerBuilder['app'];
let server: Server;

describe('API', () => {
  beforeAll(async done => {
    investorId = investors[0].id;
    walletId = wallets[0].id;
    investorName = investors[0].name;
    walletName = wallets[0].name;
    positionId = positions[0].id;
    positionAsset = positions[0].asset;
    operationId = operations[0].id;
    value = operations[0].value;
    quantity = operations[0].quantity;
    asset = assets[0];
    symbol = Object.keys(externalSourceSymbols)[0];
    const builder = mockedServerBuilder()
      .withRestAPI();
    app = builder.app;
    try {
      server = await builder.build();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to create user', async (done) => {
    const userName = user.findName();
    const password = internet.password();
    request(app)
      .post('/api/users')
      .send({ userName, password })
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.userName).toBe(userName);
        expect(res.body.role).toBe('USER');
        expect(res.body.password).toBeUndefined();
        expect(res.body.passHash).toBeUndefined();
        expect(typeof res.body.id).toEqual('string');
        done();
      });
  });

  it('should be able to sign-in', async (done) => {
    const { userName, passHash: password } = users[0];
    request(app)
      .post('/api/sessions')
      .send({ userName, password })
      .set("Accept", "application/json charset=utf-8")
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

  it('should be able to access a symbol route', async (done) => {
    const response = await request(app).get(`/api/symbols/${symbol}`);
    const values = Object.keys(externalSourceSymbols[symbol]).reduce(
      (acc, key) => ({ ...acc, [key]: expect.objectContaining({}) }),
      {},
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      [externalSourceName]: values
    });
    done();
  });

  it('should be able to post symbol when logged in as admin', async (done) => {
    const req = {
      [externalSourceName]: Object.keys(externalSourceSymbols[symbol])[0],
    };
    request(app)
      .put(`/api/symbols/${symbol}`)
      .set('Authorization', 'Token adminToken')
      .send(req)
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toBeInstanceOf(Object);
        done();
      });
  });

  it('should not be able to post symbol when logged in as user', async (done) => {
    const req = {
      [externalSourceName]: Object.keys(externalSourceSymbols[symbol])[0],
    };
    request(app)
      .put(`/api/symbols/${symbol}`)
      .set('Authorization', 'Token userToken')
      .send(req)
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.message).toEqual('Admin privilegies required to this action!');
        done();
      });
  });

  it('should be able to access a last price route', async (done) => {
    const res = await request(app).get(`/api/price/last/${asset.ticker}`);
    expect(res.status).toEqual(200);
    done();
  });

  it('should be able to load operation', async (done) => {
    request(app)
      .get(`/api/operations/${operationId}`)
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({ value, quantity, }));
        done();
      });
  });

  it('should be able to create operation', async (done) => {
    const req = {
      date: date.recent().toISOString(),
      quantity: datatype.number().toString(),
      value: `-${finance.amount()}`,
      positionId: positionId,
    };
    request(app)
      .post('/api/operations')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send(req)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          date: req.date,
          value: Number(req.value),
          quantity: Number(req.quantity),
        }));
        done();
      });
  });

  it('should be able to load position', async (done) => {
    request(app)
      .get(`/api/positions/${positionId}`)
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          wallet: expect.objectContaining({
            name: walletName,
            owner: expect.objectContaining({ name: investorName }),
          }),
          asset: positionAsset,
        }));
        expect(res.body.operations).toEqual(expect.arrayContaining([
          expect.objectContaining({ value, quantity, })
        ]));
        done();
      });
  });

  it('should be able to create position', async (done) => {
    request(app)
      .post('/api/positions')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send({ walletId, assetId: asset.id, })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          wallet: expect.objectContaining({
            name: walletName,
            owner: expect.objectContaining({ name: investorName }),
          }),
          asset: positionAsset,
          operations: [],
        }));
        done();
      });
  });

  it('should be able to load wallet', async (done) => {
    request(app)
      .get(`/api/wallets/${walletId}`)
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: walletName,
          owner: expect.objectContaining({ name: investorName }),
        }));
        expect(res.body.positions).toEqual(expect.arrayContaining([
          expect.objectContaining({
            asset: positionAsset,
            operations: expect.arrayContaining([
              expect.objectContaining({ value, quantity, })
            ]),
          })
        ]));
        done();
      });
  });

  it('should be able to create wallet', async (done) => {
    const name = finance.accountName();
    request(app)
      .post('/api/wallets')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send({ name, investorId, })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name, positions: [],
          owner: expect.objectContaining({ name: investorName }),
        }));
        done();
      });
  });

  it('should be able to load investor', async (done) => {
    request(app)
      .get(`/api/investors/${investorId}`)
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: investorName,
          wallets: expect.arrayContaining([expect.objectContaining({
            name: walletName,
            positions: expect.arrayContaining([
              expect.objectContaining({
                asset: positionAsset,
                operations: expect.arrayContaining([
                  expect.objectContaining({value, quantity, })
                ]),
              })
            ])
          })]),
        }));
        done();
      });
  });

  it('should be able to create investor', async (done) => {
    const id = '0';
    const name = user.findName();
    request(app)
      .post('/api/investors')
      .set('Authorization', 'Token userToken')
      .set("Accept", "application/json charset=utf-8")
      .send({ id, name })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          id, name, wallets: [],
        }));
        done();
      });
  });
});
