import { WalletNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';
import { isNumber } from '@utils/validators';

import {
  RepositoryChangeCommand, RepositoryChangeCommandExecutors,
  WalletRepository, PositionRepository, PersistedWalletData, WalletData,
} from '@gateway/data/contracts';

import PostgreSQL, { Executor } from '..';

type WalletModel = {
  created_on: Date;
  id: number;
  name: string;
  owner_id: string;
};

export class PostgreWalletRepository implements WalletRepository<Executor<WalletModel>> {
  private readonly selectAllWhere = 'SELECT * FROM wallets WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private positions: PositionRepository | Factory<PositionRepository>,
  ) {}

  getChangeCommandExecutors(): RepositoryChangeCommandExecutors {
    return this.db;
  }

  async loadWalletWithOwnerById(id: string): Promise<PersistedWalletData> {
    if (!isNumber(id)) {
      throw new WalletNotFoundError(id);
    }
    const [ data ] = await this.db.query<{
      name: string; owner_id: string; owner_name: string;
    }>({
      text: `SELECT
                w.name, w.owner_id, i.name owner_name
             FROM wallets w
             INNER JOIN investors i ON i.id = w.owner_id
             WHERE w.id = $1`,
      values: [id],
    });
    if (!data) {
      throw new WalletNotFoundError(id);
    }
    if (this.positions instanceof Factory) {
      this.positions = this.positions.make();
    }
    const positionIds = await this.positions.loadPositionIdsByWalletId(id);
    return {
      id, name: data.name, positionIds,
      owner: { id: data.owner_id, name: data.owner_name, },
    };
  }

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

  saveNewWallet(
    walletName: string, investorId: string
  ): RepositoryChangeCommand<WalletData,Executor<WalletModel>> {
    const query = {
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [walletName, investorId, new Date()],
    };
    const translate = ([data]: WalletModel[]) => this.modelToData(data, true);
    return async executor => translate((await executor(query)).rows);
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
