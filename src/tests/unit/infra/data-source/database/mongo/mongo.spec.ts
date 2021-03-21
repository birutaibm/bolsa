import { DatabaseConnectionError } from '@errors/database-connection';

import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';

let mongo: Mongo;

describe('Mongo database', () => {
  beforeEach(() => {
    mongo = new Mongo(env.mongodb);
  });

  afterEach(async done => {
    mongo.disconnect().then(() => done(), done);
  });

  it('should be able to connect', async done => {
    await expect(
      mongo.connect()
    ).resolves.toBeTruthy();
    done();
  });

  it('should be able to reuse mongo connection', async done => {
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
    await expect(
      mongo.createRepositoryFactories()
    ).resolves.toBeTruthy();
    done();
  });

  it('should be able to create repository factories with a connected mongo', async done => {
    await mongo.connect();
    await expect(
      mongo.createRepositoryFactories()
    ).resolves.toBeTruthy();
    done();
  });
});
