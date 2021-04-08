import request from 'supertest';

import { SingletonFactory } from '@utils/factory';
import { Factories } from '@infra/factories';
import { ServerBuilder } from '@infra/server';

import {
  FakeExternalPriceRepository,
  FakePriceRepository, FakeUserRepository, FakeWalletRepository, FakeInvestorRepository, FakePositionRepository, FakeOperationRepository
} from '@mock/data-source/repositories';
import { RepositoryFactories } from '@gateway/factories';

let app: ServerBuilder['app'];
let factories: Factories;

describe('API', () => {
  beforeAll(async done => {
    factories = new Factories(mockRepositories());
    const builder = new ServerBuilder().withRestAPI().withFactories(factories);
    mockRepositories();
    await mockSecurity();
    app = builder.app;
    try {
      builder.build();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to create user', async (done) => {
    request(app)
      .post('/api/users')
      .send({
        userName: 'meu usuário',
        password: 'minha senha',
      })
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.userName).toBe('meu usuário');
        expect(res.body.role).toBe('USER');
        expect(res.body.password).toBeUndefined();
        expect(res.body.passHash).toBeUndefined();
        expect(typeof res.body.id).toEqual('string');
        done();
      });
  });

  it('should be able to sign-in', async (done) => {
    await (await factories.ofUseCases()).user.userCreator.make().create(
      'eu mesmo',
      'minha senha',
    );
    request(app)
      .post('/api/sessions')
      .send({
        userName: 'eu mesmo',
        password: 'minha senha',
      })
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

  it('should be able to access ITUB3 symbol route', async (done) => {
    const response = await request(app).get('/api/symbols/ITUB3');
    expect(response.status).toBe(200);
    done();
  });

  it('should be able to post symbol when logged in as admin', async (done) => {
    request(app)
      .put('/api/symbols/ITUB3')
      .set('Authorization', 'Token adminToken')
      .send({
        'external source': 'ITUB3.SAO',
      })
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

  it('should be able to load operation', async (done) => {
    request(app)
      .get('/api/operations/0')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          value: -2345,
          quantity: 100,
        }));
        done();
      });
  });

  it('should be able to create operation', async (done) => {
    request(app)
      .post('/api/operations')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send({
        date: '2021-03-24',
        quantity: '100',
        value: '-1234.56',
        positionId: '0',
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          value: -1234.56,
          quantity: 100,
        }));
        done();
      });
  });

  it('should be able to load position', async (done) => {
    request(app)
      .get('/api/positions/0')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          wallet: expect.objectContaining({
            name: 'Test Existent Wallet',
            owner: expect.objectContaining({ name: 'Investor Name' }),
          }),
          asset: expect.objectContaining({
            ticker: 'BBAS3',
            name: 'Banco do Brasil',
          }),
        }));
        expect(res.body.operations).toEqual(expect.arrayContaining([
          expect.objectContaining({
            value: -2345,
            quantity: 100,
          })
        ]));
        done();
      });
  });

  it('should be able to create position', async (done) => {
    request(app)
      .post('/api/positions')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send({
        walletId: '0',
        assetId: '0',
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          wallet: expect.objectContaining({
            name: 'Test Existent Wallet',
            owner: expect.objectContaining({ name: 'Investor Name' }),
          }),
          asset: expect.objectContaining({
            ticker: 'BBAS3',
            name: 'Banco do Brasil',
          }),
          operations: [],
        }));
        done();
      });
  });

  it('should be able to load wallet', async (done) => {
    request(app)
      .get('/api/wallets/0')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: 'Test Existent Wallet',
          owner: expect.objectContaining({ name: 'Investor Name' }),
        }));
        expect(res.body.positions).toEqual(expect.arrayContaining([
          expect.objectContaining({
            asset: expect.objectContaining({
              ticker: 'BBAS3',
              name: 'Banco do Brasil',
            }),
            operations: expect.arrayContaining([
              expect.objectContaining({
                value: -2345,
                quantity: 100,
              })
            ]),
          })
        ]));
        done();
      });
  });

  it('should be able to create wallet', async (done) => {
    request(app)
      .post('/api/wallets')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .send({
        name: 'My Wallet', investorId: '1',
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: 'My Wallet',
          owner: expect.objectContaining({ name: 'Investor Name' }),
          positions: [],
        }));
        done();
      });
  });

  it('should be able to load investor', async (done) => {
    request(app)
      .get('/api/investors/1')
      .set('Authorization', 'Token adminToken')
      .set("Accept", "application/json charset=utf-8")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: 'Investor Name',
          wallets: expect.arrayContaining([expect.objectContaining({
            name: 'Test Existent Wallet',
            positions: expect.arrayContaining([
              expect.objectContaining({
                asset: expect.objectContaining({
                  ticker: 'BBAS3',
                  name: 'Banco do Brasil',
                }),
                operations: expect.arrayContaining([
                  expect.objectContaining({
                    value: -2345,
                    quantity: 100,
                  })
                ]),
              })
            ])
          })]),
        }));
        done();
      });
  });

  it('should be able to create investor', async (done) => {
    request(app)
      .post('/api/investors')
      .set('Authorization', 'Token userToken')
      .set("Accept", "application/json charset=utf-8")
      .send({
        id: '0',
        name: 'My Own Name'
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(expect.objectContaining({
          name: 'My Own Name',
          wallets: [],
          id: '0',
        }));
        done();
      });
  });

  it('should not be able to post symbol when logged in as user', async (done) => {
    request(app)
      .put('/api/symbols/VALE3')
      .set('Authorization', 'Token userToken')
      .send({
        'external source': 'VALE3.SAO',
      })
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

  it('should be able to access ITUB4 last price route', async (done) => {
    const res = await request(app).get('/api/price/last/ITUB4');
    expect(res.status).toEqual(200);
    done();
  });
});

async function mockSecurity() {
  const security = (await factories.ofSecurity()).make();
  jest.spyOn(security, 'verifyToken').mockImplementation(token => {
    switch (token) {
      case 'userToken':
        return { id: '0', userName: 'testUser', role: 'USER' };
      case 'adminToken':
        return { id: '1', userName: 'testAdmin', role: 'ADMIN' };
      default:
        console.log(token);
        return {};
    }
  });
}

function mockRepositories(): RepositoryFactories {
  const prices = new SingletonFactory(() => ({
    internal: new FakePriceRepository(),
    externals: [new FakeExternalPriceRepository()],
  }));
  return {
    disconnectAll: async () => [],
    prices,
    users: new SingletonFactory(() => new FakeUserRepository()),
    investors: new SingletonFactory(() => new FakeInvestorRepository()),
    wallets: new SingletonFactory(() => new FakeWalletRepository()),
    positions: new SingletonFactory(() => new FakePositionRepository(
      prices.make().internal
    )),
    operations: new SingletonFactory(() => new FakeOperationRepository()),
  };
}
