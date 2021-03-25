import factories from '@infra/factories';

import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';

let mongo: Mongo;

describe('Factories at infra', () => {
  beforeAll(async done => {
    mongo = new Mongo(env.mongodb);
    try {
      mongo.connect();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      mongo.disconnect();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to reuse instance of repositories factories', async (done) => {
    const instance = await factories.ofRepositories();
    await expect(
      factories.ofRepositories()
    ).resolves.toBe(instance);
    done();
  });

  it('should be able to reuse instance of security factories', async (done) => {
    const instance = await factories.ofSecurity();
    await expect(
      factories.ofSecurity()
    ).resolves.toBe(instance);
    done();
  });

  it('should be able to reuse instance of use-cases factories', async (done) => {
    const instance = await factories.ofUseCases();
    await expect(
      factories.ofUseCases()
    ).resolves.toBe(instance);
    done();
  });

  it('should be able to reuse instance of controllers factories', async (done) => {
    const instance = await factories.ofControllers();
    await expect(
      factories.ofControllers()
    ).resolves.toBe(instance);
    done();
  });
});
