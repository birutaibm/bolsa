import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { InvestorNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';

import {
  InvestorRepository,
  PersistedWalletData, PositionRepository, WalletData, WalletRepository
} from '@gateway/data/contracts';

import PostgreSQL from '..';
import { MayBePromise } from '@domain/wallet/usecases/dtos';

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
    if (isNaN(Number(id))) {
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
    ids = ids.filter(id => !isNaN(Number(id)));
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

  private async modelToData(
    {id, name, owner_id}: WalletModel
  ): Promise<WalletData> {
    if (this.positions instanceof Factory) {
      this.positions = this.positions.make();
    }
    const positionIds = await this.positions.loadPositionIdsByWalletId(String(id));
    return {
      id: String(id),
      name,
      ownerId: owner_id,
      positionIds,
    };
  }
}
