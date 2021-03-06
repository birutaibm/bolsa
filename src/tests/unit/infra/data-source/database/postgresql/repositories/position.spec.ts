import { PositionNotFoundError } from '@errors/not-found';

import { AssetData } from '@gateway/data/contracts';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgrePositionRepository } from '@infra/data-source/database/postgresql/repositories/position';

type WalletData = {id: string;};
type InvestorData = {id: string;};

let db: PostgreSQL;
let repo: PostgrePositionRepository;
let investor: InvestorData;
let wallet: WalletData;
let asset: Omit<AssetData, 'prices'>;
let positions: string[];

describe('Postgre position repository', () => {
  beforeAll(async done => {
    try {
      db = new PostgreSQL(env.postgre);
      const [ { id: userId } ] = await db.query<{id: string}>({
        text: `INSERT INTO users(username, pass_hash, role, created_on)
        VALUES ($1, $2, $3, $4) RETURNING id`,
        values: ['userName', '123456', 'USER', new Date()],
      });
      [ investor ] = await db.query<InvestorData>({
        text: 'INSERT INTO investors(id, name, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: [userId, 'Rafael Arantes', new Date()],
      });
      [ wallet ] = await db.query<WalletData>({
        text: 'INSERT INTO wallets(name, owner_id, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: ['Wallet for position tests', investor.id, new Date()],
      });
      [ asset ] = await db.query<{id: string; ticker: string; name: string;}>({
        text: 'INSERT INTO assets(name, ticker, created_on) VALUES ($1, $2, $3) RETURNING id, ticker, name',
        values: ['Asset used at position test', 'POSI3', new Date()],
      });
      const factories = db.createRepositoryFactories();
      repo = factories.positions.make();
      positions = [];
    } catch (error) {
      console.error(error);
      done(error);
    }
    done();
  });

  afterEach(async done => {
    try {
      if (positions.length > 0) {
        const params = positions.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM positions WHERE id IN (${params})`,
          values: positions,
        };
        await db.query(query);
        positions = [];
      }
    } catch (error) {
      done(error);
    }
    done();
  });

  afterAll(async done => {
    try {
      if (positions.length > 0) {
        const params = positions.map((_, i) => `$${i+1}`).join(',');
        await db.query({
          text: `DELETE FROM positions WHERE id IN (${params})`,
          values: positions,
        });
        positions = [];
      }
      await db.query({
        text: `DELETE FROM assets WHERE id = $1`,
        values: [asset.id],
      });
      await db.query({
        text: `DELETE FROM wallets WHERE id = $1`,
        values: [wallet.id],
      });
      await db.query({
        text: `DELETE FROM investors WHERE id = $1`,
        values: [investor.id],
      });
      await db.query({
        text: `DELETE FROM users WHERE id = $1`,
        values: [investor.id],
      });
      await db.disconnect();
    } catch (error) {
      done(error)
    }
    done();
  });

  it('should be able to load existent position', async done => {
    const [ { id } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [asset.id, wallet.id, new Date()],
    });
    positions.push(id);
    await expect(
      repo.loadPositionDataById(id)
    ).resolves.toEqual(expect.objectContaining({
      asset: expect.objectContaining(asset),
      walletId: String(wallet.id),
      operationIds: [],
    }));
    done();
  });

  it('should be able to load position with operation', async done => {
    const [ { id } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [asset.id, wallet.id, new Date()],
    });
    positions.push(id);
    const opData = {
      date: new Date(),
      quantity: 100,
      value: -2345,
    };
    const [ { id: operationId } ] = await db.query<{id: string}>({
      text: `INSERT INTO operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [opData.date, opData.quantity, opData.value, id, new Date()],
    });
    await expect(
      repo.loadPositionDataById(id)
    ).resolves.toEqual(expect.objectContaining({
      operationIds: [String(operationId)]
    }));
    await db.query({
      text: 'DELETE FROM operations WHERE id = $1',
      values: [operationId],
    })
    done();
  });

  it('should not be able to load inexistent position', async done => {
    await expect(
      repo.loadPositionDataById('987')
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    await expect(
      repo.loadPositionDataById('pId')
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });

  it('should be able to load position ids by walletId', async done => {
    const [ { id } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [asset.id, wallet.id, new Date()],
    });
    positions.push(id);
    await expect(
      repo.loadPositionIdsByWalletId(wallet.id)
    ).resolves.toEqual(expect.arrayContaining([String(id)]));
    done();
  });

  it('should be able to return empty position ids list by invalid walletId', async done => {
    const [ { id } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [asset.id, wallet.id, new Date()],
    });
    positions.push(id);
    await expect(
      repo.loadPositionIdsByWalletId('wId')
    ).resolves.toEqual([]);
    done();
  });

  it('should be able to load existents positions by ids', async done => {
    const [ { id } ] = await db.query<{id: string;}>({
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING id`,
      values: [asset.id, wallet.id, new Date()],
    });
    positions.push(id);
    await expect(
      repo.loadPositionsDataByIds([id, '987', 'pId'])
    ).resolves.toEqual([expect.objectContaining({
      asset: expect.objectContaining(asset),
      walletId: String(wallet.id),
      operationIds: [],
    })]);
    done();
  });

  it('should be able to create position', async done => {
    const position = await db.singleCommandExecutor(repo.saveNewPosition(
      asset.id, wallet.id
    ));
    const createdId = position.id;
    positions.push(createdId);
    await expect(
      db.query({
        text: 'SELECT * FROM positions WHERE id = $1', values: [createdId],
      })
    ).resolves.toEqual([
      expect.objectContaining({
        id: Number(createdId), asset_id: asset.id, wallet_id: wallet.id,
      })
    ]);
    done();
  });
});
