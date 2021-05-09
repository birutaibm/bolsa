import { AssetNotFoundError, InvestorNotFoundError } from '@errors/not-found';
import { SingletonFactory } from '@utils/factory';

import { InvestorData, WalletData } from '@gateway/data/contracts';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgreInvestorRepository } from '@infra/data-source/database/postgresql/repositories/investor';

let db: PostgreSQL;
let repo: PostgreInvestorRepository;
let dto: {
  id: string;
  name: string;
};
let investors: string[];

describe('Postgre investor repository', () => {
  beforeAll(async done => {
    investors = [];
    try {
      db = new PostgreSQL(env.postgre);
      const [ { id: userId } ] = await db.query<{id: string}>({
        text: `INSERT INTO users(username, pass_hash, role, created_on)
        VALUES ($1, $2, $3, $4) RETURNING id`,
        values: ['userName', '123456', 'USER', new Date()],
      });
      dto = {
        id: userId,
        name: 'Rafael Arantes',
      };
      const factories = db.createRepositoryFactories(
        new SingletonFactory(() => ({
          loadAssetDataById: (id) => {throw new AssetNotFoundError(id);}
        })),
      );
      repo = factories.investors.make();
    } catch (error) {
      console.error(error);
      done(error);
    }
    done();
  });

  afterEach(async done => {
    try {
      if (investors.length > 0) {
        const params = investors.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM investors WHERE id IN (${params})`,
          values: investors,
        };
        await db.query(query);
        investors = [];
      }
    } catch (error) {
      done(error);
    }
    done();
  });

  afterAll(async done => {
    try {
      if (investors.length > 0) {
        const params = investors.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM investors WHERE id IN (${params})`,
          values: investors,
        };
        await db.query(query);
        investors = [];
      }
      await db.query({
        text: `DELETE FROM users WHERE id = $1`,
        values: [dto.id],
      });
      await db.disconnect();
    } catch (error) {
      done(error);
    }
    done();
  });

  it('should be able to load existent investor', async done => {
    const [ {id} ] = await db.query<InvestorData>({
      text: `INSERT INTO investors(id, name, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [dto.id, dto.name, new Date()],
    });
    investors.push(id);
    await expect(
      repo.loadInvestorDataById(id)
    ).resolves.toEqual(expect.objectContaining(dto));
    done();
  });

  it('should not be able to load inexistent investor', async done => {
    await expect(
      repo.loadInvestorDataById(dto.id)
    ).rejects.toBeInstanceOf(InvestorNotFoundError);
    done();
  });

  it('should be able to create investor', async done => {
    const investor = await db.singleCommandExecutor(repo.saveNewInvestor(dto));
    const createdId = investor.id;
    investors.push(createdId);
    await expect(
      db.query({
        text: 'SELECT * FROM investors WHERE id = $1', values: [createdId],
      })
    ).resolves.toEqual([
      expect.objectContaining(dto)
    ]);
    done();
  });

  it('should be able to load investor when trying to save as new with existent id', async done => {
    const [ {id} ] = await db.query<InvestorData>({
      text: `INSERT INTO investors(id, name, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [dto.id, dto.name, new Date()],
    });
    investors.push(id);
    await expect(
      db.singleCommandExecutor(repo.saveNewInvestor({ ...dto, id }))
    ).resolves.toEqual(expect.objectContaining({ id }));
    done();
  });

  it('should be able to load investor with wallets', async done => {
    const [ {id} ] = await db.query<InvestorData>({
      text: `INSERT INTO investors(id, name, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [dto.id, dto.name, new Date()],
    });
    const [ {id: walletId} ] = await db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: ['Wallet of investor test', id, new Date()],
    });
    investors.push(id);
    await expect(
      repo.loadInvestorDataById(id)
    ).resolves.toEqual(expect.objectContaining({
      walletIds: [String(walletId)]
    }));
    await db.query({
      text: 'DELETE FROM wallets WHERE id = $1',
      values: [walletId],
    })
    done();
  });
});
