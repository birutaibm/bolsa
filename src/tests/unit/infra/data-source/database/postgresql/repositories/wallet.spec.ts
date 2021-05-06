import { WalletNotFoundError } from '@errors/not-found';
import { SingletonFactory } from '@utils/factory';

import { InvestorData, RepositoryChangeCommandExecutor, WalletData } from '@gateway/data/contracts';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgreWalletRepository } from '@infra/data-source/database/postgresql/repositories/wallet';

let db: PostgreSQL;
let repo: PostgreWalletRepository;
let dto: {
  name: string;
  ownerId: string;
};
let investor: InvestorData;
let wallets: string[];

describe('Postgre wallet repository', () => {
  beforeAll(async done => {
    try {
      db = new PostgreSQL(env.postgre);
      [ investor ] = await db.query<InvestorData>({
        text: 'INSERT INTO investors(id, name, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: ['walletTest_investorId123', 'Rafael Arantes', new Date()],
      });
      dto = {
        name: 'my wallet',
        ownerId: investor.id,
      };
      const factories = await db.createRepositoryFactories(
        new SingletonFactory(() => ({
          loadAssetDataById: (id) => ({id, ticker: 'asset', name: 'asset', prices: []})
        })),
      );
      repo = factories.wallets.make();
      wallets = [];
    } catch (error) {
      console.error(error);
      done(error);
    }
    done();
  });

  afterEach(async done => {
    try {
      if (wallets.length > 0) {
        const params = wallets.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM wallets WHERE id IN (${params})`,
          values: wallets,
        };
        await db.query(query);
        wallets = [];
      }
    } catch (error) {
      done(error);
    }
    done();
  });

  afterAll(async done => {
    try {
      if (wallets.length > 0) {
        const params = wallets.map((_, i) => `$${i+1}`).join(',');
        await db.query({
          text: `DELETE FROM wallets WHERE id IN (${params})`,
          values: wallets,
        });
        wallets = [];
      }
      await db.query({
        text: `DELETE FROM investors WHERE id = $1`,
        values: [investor.id],
      });
      await db.disconnect();
    } catch (error) {
      done(error)
    }
    done();
  });

  it('should be able to load existent wallet', async done => {
    expect(investor.id.length).toBe(24);
    dto.name = 'load existent';
    const [ { id } ] = await db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [dto.name, dto.ownerId, new Date()],
    });
    wallets.push(id);
    await expect(
      repo.loadWalletDataById(id)
    ).resolves.toEqual(expect.objectContaining(dto));
    done();
  });

  it('should be able to load wallet with position', async done => {
    dto.name = 'load with positions';
    const [ { id } ] = await db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [dto.name, dto.ownerId, new Date()],
    });
    wallets.push(id);
    const [ { id: positionId } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: ['assetId', id, new Date()],
    });
    await expect(
      repo.loadWalletDataById(id)
    ).resolves.toEqual(expect.objectContaining({
      positionIds: [String(positionId)]
    }));
    await db.query({
      text: 'DELETE FROM positions WHERE id = $1',
      values: [positionId],
    })
    done();
  });

  it('should not be able to load inexistent wallet', async done => {
    await expect(
      repo.loadWalletDataById('987')
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    await expect(
      repo.loadWalletDataById('wId')
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });

  it('should be able to load wallet ids by ownerId', async done => {
    dto.name = 'load by owner';
    const [ { id } ] = await db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [dto.name, dto.ownerId, new Date()],
    });
    wallets.push(id);
    await expect(
      repo.loadWalletIdsByOwnerId(dto.ownerId)
    ).resolves.toEqual(expect.arrayContaining([String(id)]));
    done();
  });

  it('should be able to load existents wallets by ids', async done => {
    dto.name = 'load existents';
    const [ { id } ] = await db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [dto.name, dto.ownerId, new Date()],
    });
    wallets.push(id);
    await expect(
      repo.loadWalletsDataByIds([id, '987', 'wId'])
    ).resolves.toEqual([expect.objectContaining(dto)]);
    done();
  });

  it('should be able to create wallet', async done => {
    const wallet = await db.singleCommandExecutor(repo.saveNewWallet(
      'saved', dto.ownerId
    ));
    const createdId = wallet.id;
    wallets.push(createdId);
    await expect(
      db.query({
        text: 'SELECT * FROM wallets WHERE id = $1', values: [createdId],
      })
    ).resolves.toEqual([
      expect.objectContaining({name: 'saved', owner_id: dto.ownerId})
    ]);
    done();
  });
});
