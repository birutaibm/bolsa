import axios, { AxiosInstance } from 'axios';

import { Users } from '@infra/data-source/model';
import { ServerBuilder, Server } from '@infra/server';

let api: AxiosInstance;
let server: Server;

describe('Server', () => {
  beforeAll(async done => {
    server = await new ServerBuilder().withRestAPI().withGraphQL().build();
    server.start();
    api = axios.create({
      baseURL: server.url,
    });
    done();
  });

  afterAll(async done => {
    await server.stop();
    done();
  });

  it('should be able to create all', async (done) => {
    const user = {
      userName: 'meu usuário',
      password: 'minha senha',
      role: 'ADMIN',
    };
    const userCreation = await createUser(user);
    userCreation.test();
    const token = await signIn(user);
    //const assetId = await createAsset(token);
    await userCreation.clear();
    done();
  });
});

async function createUser(user: { userName: string; password: string; role: string; }) {
  const { status, data } = await api.post('/api/users', user);
  const test = {
    user: data,
    test() {
      expect(status).toBe(201);
      expect(data).toBeInstanceOf(Object);
      expect(data.userName).toBe('meu usuário');
      expect(data.role).toBe('USER');
      expect(Object.keys(data).length).toBe(2);
    },

    async clear() {
      await Users.deleteOne({ userName: 'meu usuário' });
    },
  };
  return test;
}

async function signIn(user: { userName: string; password: string; }) {
  const { status, data } = await api.post('/api/session', user);
  expect(status).toEqual(201);
  expect(data.token).toBeInstanceOf(String);
  return data.token;
}

async function createAsset(token: string): Promise<string> {
  const { status, data } = await api.put(
    '/api/symbols/ITUB3',
    { alphavantage: 'ITUB3.SAO' },
    { headers: { authorization: `Token ${token}` } }
  );
  expect(status).toEqual(201);
  // TODO: return assetId
  throw new Error('Function not implemented.');
}
