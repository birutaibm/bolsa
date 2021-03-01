import request from 'supertest';

import { SingletonFactory } from '@utils/factory';
import factories from '@infra/factories';
import { ServerBuilder } from '@infra/server';

import {
  FakeExternalPriceRepository,
  FakePriceRepository, FakeUserRepository
} from '@mock/data-source/repositories';

let app: ServerBuilder['app'];

describe('API', () => {
  beforeAll(async done => {
    const builder = new ServerBuilder().withRestAPI();
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

  it('should be able to access ITUB3 symbol route', async (done) => {
    const response = await request(app).get('/api/symbols/ITUB3');
    expect(response.status).toBe(200);
    done();
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
      .put('/api/symbols/ITUB3')
      .set('Authorization', 'Token validToken')
      .send({
        'external source': 'ITUB3.SAO',
      })
      .set("Accept", "application/json")
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
    const security = (await factories.ofSecurity()).make();
    jest.spyOn(security, 'verifyToken').mockImplementationOnce(token => {
      if (token === 'validToken')
        return {
          role: 'USER',
        };
      return {};
    });
    request(app)
      .put('/api/symbols/VALE3')
      .set('Authorization', 'Token validToken')
      .send({
        'external source': 'VALE3.SAO',
      })
      .set("Accept", "application/json")
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
