import axios, { AxiosInstance } from 'axios';
import faker from 'faker';

import { MayBePromise } from '@utils/types';

import { ServerBuilder, Server } from '@infra/server';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { PostgreSQL } from '@infra/data-source/database';
import { env } from '@infra/environment';
import { securityFactory } from '@infra/factories';

let api: AxiosInstance;
let server: Server;
let postgre: PostgreSQL;
let clearFunctions: Array<() => MayBePromise<any>>;

describe('Server', () => {
  beforeAll(async done => {
    try {
      clearFunctions = [];
      const repositories = new RepositoryFactoriesBuilder()
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withPostgre(env.postgre);
      postgre = repositories.getPostgreSQL();
      server = await new ServerBuilder()
        .withRepositories(repositories.asSingletonFactory())
        .withSecurity(securityFactory(env.jwt))
        .withRestAPI()
        .withGraphQL()
        .build();
      await server.start();
      api = axios.create({
        baseURL: server.url,
      });
      done();
    } catch (error) {
      done(error);
    }
  });

  afterEach(async done => {
    let error: Error | undefined = undefined;
    let clear = clearFunctions.pop();
    while (clear) {
      try {
        await clear();
      } catch (err) {
        if (!error) error = err;
      }
      clear = clearFunctions.pop();
    }
    error ? done(error) : done();
  });

  afterAll(async done => {
    try {
      await server.stop();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to create user', async done => {
    const { response } = await createUser();
    expect(response.status).toBe(201);
    done();
  });

  it('should be able to sign in', async done => {
    const { data } = await createUser();
    const { response } = await signIn(data);
    expect(response.status).toBe(201);
    expect(typeof response.data.token).toEqual('string');
    done();
  });

  it('should be able to create asset', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response } = await createAsset(token);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining({
      ticker: 'BBAS3', source: 'alphavantage', externalSymbol: 'BBAS3.SAO',
      id: expect.stringContaining(''),
    }));
    done();
  });

  it('should be able to create investor', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response, data } = await createInvestor(token, user.id);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining(
      { name: data.name, id: data.id, wallets: [] }
    ));
    done();
  });

  it('should be able to create wallet', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response: { data: { id: investorId } } } = await createInvestor(token, user.id);
    const { response, data } = await createWallet(token, investorId);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining({
      name: data.name,
      owner: expect.objectContaining({
        id: data.investorId, name: expect.stringContaining(''),
      }),
    }));
    done();
  });

  it('should be able to create position', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response: { data: { id: assetId } } } = await createAsset(token);
    const { response: { data: { id: investorId } } } = await createInvestor(token, user.id);
    const { response: { data: {id: walletId } } } = await createWallet(token, investorId);
    const { response } = await createPosition(token, walletId, assetId);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining({
      wallet: expect.objectContaining({ id: walletId }),
      asset: expect.objectContaining({ id: assetId }),
    }));
    done();
  });

  it('should be able to create operation', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response: { data: { id: assetId } } } = await createAsset(token);
    const { response: { data: { id: investorId } } } = await createInvestor(token, user.id);
    const { response: { data: { id: walletId } } } = await createWallet(token, investorId);
    const { response: { data: { id: positionId } } } = await createPosition(token, walletId, assetId);
    const { response, data } = await createOperation(token, positionId);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining({
      date: data.date, position: expect.objectContaining({
        id: positionId,
        asset: expect.objectContaining({id: assetId}),
        wallet: expect.objectContaining({
          id: walletId,
          owner: expect.objectContaining({id: investorId}),
        })
      })
    }));
    done();
  });

  it('should be able to create operation and their dependencies', async done => {
    const { data: user } = await createUser();
    const { response: {data: {token}} } = await signIn(user);
    const { response: { data: { id: assetId } } } = await createAsset(token);
    const { response, data } = await createOperationAndDependencies(user.id, assetId, token);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expect.objectContaining({
      date: data.date, position: expect.objectContaining({
        asset: expect.objectContaining({id: assetId}),
        wallet: expect.objectContaining({
          name: data.walletName,
          owner: expect.objectContaining({name: data.investorName}),
        }),
      }),
    }));
    done();
  });
});

async function createUser() {
  const user = {
    userName: faker.internet.email(),
    password: faker.internet.password(),
    role: 'ADMIN',
  };
  const { status, data } = await api.post('/api/users', user);
  clearFunctions.push(() => postgre.query({
    text: `DELETE FROM users WHERE id = $1`,
    values: [data.id],
  }));
  return {
    response: { status, data },
    data: { ...user, id: data.id },
  };
}

async function signIn(user: { userName: string; password: string; }) {
  const response = await api.post('/api/sessions', user);
  return { response };
}

async function createAsset(token: string) {
  const { status, data } = await api.put(
    '/api/symbols/BBAS3',
    { alphavantage: 'BBAS3.SAO' },
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(() => postgre.query({
    text: `DELETE FROM assets WHERE id = $1`,
    values: [data[0].id],
  }));
  clearFunctions.push(() => postgre.query({
    text: `DELETE FROM external_price_symbols
           WHERE asset_id = $1 AND source = $2`,
    values: [data[0].id, 'alphavantage'],
  }));
  clearFunctions.push(() => postgre.query({
    text: `DELETE FROM prices WHERE asset_id = $1`,
    values: [data[0].id],
  }));
  return { response: {status, data: data[0]}};
}

async function createInvestor(token: string, id: string) {
  const data = {
    name: faker.name.findName(),
    id,
  };
  const response = await api.post(
    '/api/investors',
    data,
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(() => postgre.query({
    text: 'DELETE FROM investors WHERE id = $1',
    values: [response.data.id],
  }));
  return {
    response: { status: response.status, data: response.data },
    data
  };
}

async function createWallet(token: string, investorId: string) {
  const data = {
    name: faker.finance.accountName(),
    investorId,
  };
  const response = await api.post(
    '/api/wallets',
    data,
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(() => postgre.query({
    text: 'DELETE FROM wallets WHERE id = $1',
    values: [response.data.id]
  }));
  return {
    response: { status: response.status, data: response.data },
    data
  };
}

async function createPosition(token: string, walletId: string, assetId: string) {
  const data = { walletId, assetId };
  const response = await api.post(
    '/api/positions',
    data,
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(() => postgre.query({
    text: 'DELETE FROM positions WHERE id = $1',
    values: [response.data.id]
  }));
  return {
    response: { status: response.status, data: response.data },
    data
  };
}

async function createOperation(token: string, positionId: string) {
  const data = {
    date: faker.date.recent().toISOString(),
    quantity: String(-1 * faker.datatype.number({min: 1})),
    value: faker.finance.amount(1),
    positionId,
  };
  const response = await api.post(
    '/api/operations',
    data,
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(() => postgre.query({
    text: 'DELETE FROM operations WHERE id = $1',
    values: [response.data.id]
  }));
  return {
    response: { status: response.status, data: response.data },
    data
  };
}

async function createOperationAndDependencies(userId: string, assetId: string, token: string) {
  const data = {
    date: faker.date.recent().toISOString(),
    quantity: String(-1 * faker.datatype.number({min: 1})),
    value: faker.finance.amount(),
    assetId,
    walletName: faker.finance.accountName(),
    userId,
    investorName: faker.name.findName(),
  };
  const response = await api.post(
    '/api/operations',
    data,
    { headers: { authorization: `Token ${token}` } }
  );
  clearFunctions.push(async () => {
    await postgre.query({
      text: 'DELETE FROM operations WHERE id = $1',
      values: [response.data.id]
    });
    await postgre.query({
      text: 'DELETE FROM positions WHERE id = $1',
      values: [response.data.position.id]
    });
    await postgre.query({
      text: 'DELETE FROM wallets WHERE id = $1',
      values: [response.data.position.wallet.id]
    });
    await postgre.query({
      text: 'DELETE FROM investors WHERE id = $1',
      values: [response.data.position.wallet.owner.id]
    });
  });
  return {
    response: { status: response.status, data: response.data },
    data
  };
}
