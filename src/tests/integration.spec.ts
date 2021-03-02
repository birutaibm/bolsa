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

  afterAll(() => {
    server.stop();
  });

  it('should be able to create user', async (done) => {
    //GIVEN:
    // server is running
    //WHEN:
    const { status, data } = await api.post('/api/users', {
      userName: 'meu usuário',
      password: 'minha senha',
    });
    //THEN:
    expect(status).toBe(201);
    expect(data).toBeInstanceOf(Object);
    expect(data.userName).toBe('meu usuário');
    expect(data.role).toBe('USER');
    expect(Object.keys(data).length).toBe(2);
    //CLEAR:
    await Users.deleteOne({ userName: 'meu usuário' });
    done();
  });
});
