import { DatabaseConnectionError } from '@errors/database-connection';

import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';

describe('Mongo database', () => {
  it('should be able to connect', async done => {
    const mongo = new Mongo(env.mongodb);
    await expect(
      mongo.connect()
    ).resolves.toBeTruthy();
    done();
  });

  it('should be able to reuse mongo connection', async done => {
    const mongo = new Mongo(env.mongodb);
    const connection = await mongo.connect();
    await expect(
      mongo.connect()
    ).resolves.toBe(connection);
    done();
  });

  it('should not be able to connect with wrong config', async done => {
    const mongo = new Mongo({
      ...env.mongodb,
      uri: 'http://www.google.com',
    });
    await expect(
      mongo.connect()
    ).rejects.toBeInstanceOf(DatabaseConnectionError);
    done();
  });

  it('should be able to create repository factories', async done => {
    const mongo = new Mongo(env.mongodb);
    await expect(
      mongo.createRepositoryFactories()
    ).resolves.toBeTruthy();
    done();
  });

  it('should be able to create repository factories with a connected mongo', async done => {
    const mongo = new Mongo(env.mongodb);
    await mongo.connect();
    await expect(
      mongo.createRepositoryFactories()
    ).resolves.toBeTruthy();
    done();
  });
});
