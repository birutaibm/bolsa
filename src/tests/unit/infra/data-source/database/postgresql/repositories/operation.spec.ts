import { OperationNotFoundError } from '@errors/not-found';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgreOperationRepository } from '@infra/data-source/database/postgresql/repositories/operation';

type Data = {id: string;};

let db: PostgreSQL;
let repo: PostgreOperationRepository;
let dto: {
  date: Date;
  quantity: number;
  value: number;
};
let investor: Data;
let wallet: Data;
let asset: {id: string; ticker: string; name: string;};
let position: Data;
let operations: string[];

describe('Postgre operation repository', () => {
  beforeAll(async done => {
    operations = [];
    try {
      db = new PostgreSQL(env.postgre);
      const [ { id: userId } ] = await db.query<{id: string}>({
        text: `INSERT INTO users(username, pass_hash, role, created_on)
        VALUES ($1, $2, $3, $4) RETURNING id`,
        values: ['userName', '123456', 'USER', new Date()],
      });
      [ investor ] = await db.query<Data>({
        text: 'INSERT INTO investors(id, name, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: [userId, 'Rafael Arantes', new Date()],
      });
      [ wallet ] = await db.query<Data>({
        text: 'INSERT INTO wallets(name, owner_id, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: ['Wallet for operation tests', investor.id, new Date()],
      });
      [ asset ] = await db.query<{id: string; ticker: string; name: string;}>({
        text: 'INSERT INTO assets(name, ticker, created_on) VALUES ($1, $2, $3) RETURNING id, ticker, name',
        values: ['Asset used in operation test', 'OPER3', new Date()],
      });
      [ position ] = await db.query<Data>({
        text: 'INSERT INTO positions(asset_id, wallet_id, created_on) VALUES ($1, $2, $3) RETURNING *',
        values: [asset.id, wallet.id, new Date()],
      });
      dto = {
        date: new Date(),
        quantity: 100,
        value: -2345,
      };
      const factories = db.createRepositoryFactories();
      repo = factories.operations.make();
    } catch (error) {
      console.error(error);
      done(error);
    }
    done();
  });

  afterEach(async done => {
    try {
      if (operations.length > 0) {
        const params = operations.map((_, i) => `$${i+1}`).join(',');
        await db.query({
          text: `DELETE FROM operations WHERE id IN (${params})`,
          values: operations,
        });
        operations = [];
      }
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      if (operations.length > 0) {
        const params = operations.map((_, i) => `$${i+1}`).join(',');
        await db.query({
          text: `DELETE FROM operations WHERE id IN (${params})`,
          values: operations,
        });
        operations = [];
      }
      await db.query({
        text: `DELETE FROM positions WHERE id = $1`,
        values: [position.id],
      });
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

  it('should be able to load existent operation', async done => {
    const [ { id } ] = await db.query<Data>({
      text: `INSERT INTO operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [dto.date, dto.quantity, dto.value, position.id, new Date()],
    });
    operations.push(id);
    await expect(
      repo.loadOperationDataById(id)
    ).resolves.toEqual(expect.objectContaining(dto));
    done();
  });

  it('should be able to load existents operations by ids', async done => {
    const [ { id } ] = await db.query<Data>({
      text: `INSERT INTO operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [dto.date, dto.quantity, dto.value, position.id, new Date()],
    });
    operations.push(id);
    await expect(
      repo.loadOperationsDataByIds([id, '6543', 'oId'])
    ).resolves.toEqual([expect.objectContaining(dto)]);
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      repo.loadOperationDataById('6543')
    ).rejects.toBeInstanceOf(OperationNotFoundError);
    await expect(
      repo.loadOperationDataById('oId')
    ).rejects.toBeInstanceOf(OperationNotFoundError);
    done();
  });

  it('should be able to load operation ids by positionId', async done => {
    const [ { id } ] = await db.query<Data>({
      text: `INSERT INTO operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [dto.date, dto.quantity, dto.value, position.id, new Date()],
    });
    operations.push(id);
    await expect(
      repo.loadOperationIdsByPositionId(position.id)
    ).resolves.toEqual(expect.arrayContaining([String(id)]));
    done();
  });

  it('should be able to return empty position ids list by invalid walletId', async done => {
    const [ { id } ] = await db.query<Data>({
      text: `INSERT INTO operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [dto.date, dto.quantity, dto.value, position.id, new Date()],
    });
    operations.push(id);
    await expect(
      repo.loadOperationIdsByPositionId('pId')
    ).resolves.toEqual([]);
    done();
  });

  it('should be able to save operation', async done => {
    const operation = await db.singleCommandExecutor(repo.saveNewOperation({
      ...dto,
      positionId: position.id,
    }));
    const createdId = operation.id;
    operations.push(createdId);
    await expect(
      db.query({
        text: 'SELECT * FROM operations WHERE id = $1', values: [createdId],
      })
    ).resolves.toEqual([expect.objectContaining({
      date: dto.date,
      quantity: dto.quantity,
      value: dto.value + '.00',
      id: Number(createdId),
      position_id: Number(position.id)
    })]);
    done();
  });
});
