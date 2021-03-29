import { WalletNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';
import { isNumber } from '@utils/validators';

import {
  PositionRepository, WalletData, WalletRepository
} from '@gateway/data/contracts';

import PostgreSQL from '..';
import { DatabaseOperationError } from '@errors/database-operation';

type WalletModel = {
  created_on: Date;
  id: number;
  name: string;
  owner_id: string;
};

export class PostgreWalletRepository implements WalletRepository {
  private readonly selectAllWhere = 'SELECT * FROM wallets WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private positions: PositionRepository | Factory<PositionRepository>,
  ) {}

  async loadWalletIdsByOwnerId(ownerId: string): Promise<string[]> {
    const models = await this.db.query<WalletModel>({
      text: `${this.selectAllWhere} owner_id = $1`,
      values: [ownerId],
    });
    return models.map(model => String(model.id));
  }

  async loadWalletDataById(id: string): Promise<WalletData> {
    if (!isNumber(id)) {
      throw new WalletNotFoundError(id);
    }
    const [ model ] = await this.db.query<WalletModel>({
      text: `${this.selectAllWhere} id = $1`,
      values: [id],
    });
    if (!model) {
      throw new WalletNotFoundError(id);
    }
    return this.modelToData(model);
  }

  async loadWalletsDataByIds(ids: string[]): Promise<WalletData[]> {
    ids = ids.filter(id => isNumber(id));
    const params = ids.map((_, i) => `$${i+1}`).join(',');
    const models = await this.db.query<WalletModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(model => this.modelToData(model)));
  }

  async saveNewWallet(
    walletName: string, investorId: string
  ): Promise<WalletData> {
    const [ data ] = await this.db.query<WalletModel>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [walletName, investorId, new Date()],
    });
    return {
      id: String(data.id),
      name: data.name,
      ownerId: data.owner_id,
      positionIds: [],
    };
  }

  async saveNewWalletAndInvestor(
    walletName: string, investorName: string, userId: string
  ): Promise<WalletData> {
    const client = await this.db.getClient();
    let wallet: WalletData | undefined = undefined;
    await client.query({ text: 'BEGIN' });
    try {
      const {rows: [{id: investorId}]} = await client.query<{id: number;}>({
        text: `INSERT INTO investors(id, name, created_on)
        VALUES ($1, $2, $3) RETURNING id`,
        values: [userId, investorName, new Date()],
      });
      const {rows: [ model ]} = await client.query<WalletModel>({
        text: `INSERT INTO wallets(name, owner_id, created_on)
        VALUES ($1, $2, $3) RETURNING *`,
        values: [walletName, investorId, new Date()],
      });
      wallet = await this.modelToData(model, true);
      await client.query('COMMIT');
      client.release();
    } catch (error) {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    if (wallet) return wallet;
    throw new DatabaseOperationError('Create wallet and investor');
  }

  private async modelToData(
    {id, name, owner_id}: WalletModel,
    translateOnly = false,
  ): Promise<WalletData> {
    let positionIds: string[] = [];
    if (!translateOnly) {
      if (this.positions instanceof Factory) {
        this.positions = this.positions.make();
      }
      positionIds = await this.positions.loadPositionIdsByWalletId(String(id));
    }
    return {
      id: String(id),
      name,
      ownerId: owner_id,
      positionIds,
    };
  }
}
