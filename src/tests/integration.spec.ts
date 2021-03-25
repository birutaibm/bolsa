import axios, { AxiosInstance } from 'axios';

import { Assets, Users } from '@infra/data-source/model';
import { ServerBuilder, Server } from '@infra/server';
import * as DatabaseModule from '@infra/data-source/database';

let api: AxiosInstance;
let server: Server;
let postgre: DatabaseModule.PostgreSQL;

describe('Server', () => {
  beforeAll(async done => {
    try {
      jest.spyOn(DatabaseModule, 'PostgreSQL').mockImplementationOnce(config => {
        postgre = new DatabaseModule.PostgreSQL(config);
        return postgre;
      });
      server = await new ServerBuilder().withRestAPI().withGraphQL().build();
      await server.start();
      api = axios.create({
        baseURL: server.url,
      });
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      await server.stop();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to create all', async (done) => {
    const user = {
      userName: 'user',
      password: '123456',
      role: 'ADMIN',
    };
    // const userCreation = await createUser(user);
    // userCreation.test();
    // const token = await signIn(user);
    // const assetCreation = await createAsset(token);
    // assetCreation.test();
    // const assetId = assetCreation.assetId;
    // const investorCreation = await createInvestor(token, userCreation.user.id);
    // investorCreation.test();
    // await investorCreation.clear();
    // await assetCreation.clear();
    // await userCreation.clear();
    done();
  });
});

async function createUser(user: { userName: string; password: string; role: string; }) {
  try {
    const { status, data } = await api.post('/api/users', user);
    const test = {
      user: data,
      test() {
        expect(status).toBe(201);
        expect(data).toBeInstanceOf(Object);
        expect(data.userName).toBe(user.userName);
        expect(data.role).toBe('ADMIN');
        expect(Object.keys(data).length).toBe(2);
      },

      async clear() {
        await Users.deleteOne({ userName: user.userName });
      },
    };
    return test;
  } catch (error) {
    fail(`Create user: ${JSON.stringify(error)}`);
  }
}

async function signIn(user: { userName: string; password: string; }) {
  try {
    const { status, data } = await api.post('/api/sessions', user);
    expect(status).toEqual(201);
    expect(typeof data.token).toEqual('string');
    return data.token;
  } catch (error) {
    fail(`Sign-in: ${JSON.stringify(error)}`);
  }
}

async function createAsset(token: string) {
  try {
    const { status, data } = await api.put(
      '/api/symbols/BBAS3',
      { alphavantage: 'BBAS3.SAO' },
      { headers: { authorization: `Token ${token}` } }
    );
    return {
      assetId: data[0].id,
      test() {
        expect(status).toEqual(201);
        expect(data).toEqual([expect.objectContaining(
          {ticker: 'BBAS3', source: 'alphavantage', externalSymbol: 'BBAS3.SAO'}
        )]);
        expect(data[0].id).toBeTruthy();
      },
      async clear() {
        await Assets.findByIdAndDelete(data[0].id);
      },
    };
  } catch (error) {
    fail(`Create asset: ${JSON.stringify(error)}`)
  }
}

async function createInvestor(token: string, id: string) {
  try {
    const { status, data } = await api.post(
      '/api/investors',
      { name: 'Investor Name', id },
      { headers: { authorization: `Token ${token}` } }
    );
    return {
      investorId: data.id,
      test() {
        expect(status).toEqual(201);
        expect(data).toEqual([expect.objectContaining(
          { name: 'Investor Name', id, wallets: [] }
        )]);
      },
      async clear() {
        await postgre.query({
          text: 'DELETE FROM investors WHERE id = $1',
          values: [data.id],
        });
      },
    };
  } catch (error) {
    fail(`Create investor: ${JSON.stringify(error)}`);
  }
}
