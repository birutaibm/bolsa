import { notNull } from '@utils/validators';

import { env } from '@infra/environment';
import { Positions, Operations, Wallets, Users } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { MongoWalletRepository } from '@infra/data-source/database/mongo/repositories/wallet';
import { WalletNotFoundError } from '@errors/wallet-not-found';

let mongo: Mongo;
let repo: MongoWalletRepository;
let positions: any[];
let operations: any[];
let wallets: any[];
let users: any[];

describe('Mongo wallet repository', () => {
  beforeAll(async done => {
    async function createRepo(): Promise<MongoWalletRepository> {
      try {
        mongo = new Mongo(env.mongodb);
        const repositories = await mongo.createRepositoryFactories();
        const repository = repositories.wallets.make();
        return repository;
      } catch (error) {
        throw error;
      }
    }
    operations = [];
    positions = [];
    wallets = [];
    users = [];
    createRepo().then(
      result => {
        repo = result
        done();
      },
      done
    );
  });

  afterEach(async done => {
    function clearTrash(err?: any) {
      operations = [];
      positions = [];
      wallets = [];
      users = [];
      done(err);
    }
    Promise.all([
      Operations.deleteMany({ _id: { $in: operations }}),
      Positions.deleteMany({ _id: { $in: positions }}),
      Wallets.deleteMany({ _id: { $in: wallets }}),
      Users.deleteMany({ _id: { $in: users }}),
    ]).then(() => clearTrash(), err => clearTrash(err));
  });

  afterAll(async done => {
    mongo.disconnect().then(() => done(), done);
  });

  it('should be able to get existent wallet', async done => {
    const user = notNull(await Users.create({
      name: 'Rafael Arantes',
      userName: 'Rafael Arantes',
      passHash: '123456',
      role: 'USER',
    }));
    const wallet = notNull(await Wallets.create({
      name: 'My wallet',
      owner: user.id,
      positions: [],
    }));
    user.wallets = [wallet.id];
    user.save();
    users.push(user.id);
    wallets.push(wallet.id);
    await expect(
      repo.getWalletFromNameAndOwner('My wallet', 'Rafael Arantes')
    ).resolves.toEqual(expect.objectContaining({name: 'My wallet'}));
    done();
  });

  it('should not be able to get inexistent wallet', async done => {
    await expect(
      repo.getWalletFromNameAndOwner('My wallet', 'Rafael Arantes')
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });

  it('should not be able to get wallet of other owner', async done => {
    const user = notNull(await Users.create({
      name: 'Rafael Arantes',
      userName: 'Rafael Arantes',
      passHash: '123456',
      role: 'USER',
    }));
    const wallet = notNull(await Wallets.create({
      name: 'My wallet',
      owner: user.id,
      positions: [],
    }));
    user.wallets = [wallet.id];
    user.save();
    users.push(user.id);
    wallets.push(wallet.id);
    await expect(
      repo.getWalletFromNameAndOwner('My wallet', 'Hacker')
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });

  it('should be able to create wallet', async done => {
    const user = notNull(await Users.create({
      name: 'Rafael Arantes',
      userName: 'Rafael Arantes',
      passHash: '123456',
      role: 'USER',
      wallets: [],
    }));
    const wallet = await repo.save({
      name: 'My wallet',
      owner: user,
      positions: [],
    });
    users.push(user.id);
    wallets.push(wallet.id);
    expect(wallet).toEqual(
      expect.objectContaining({name: 'My wallet', positions: []})
    );
    done();
  });

  // it('should be able to update wallet', async done => {
  //   done('Test not yet implemented');
  // });
});
