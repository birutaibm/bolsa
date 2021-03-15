import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { InvestorNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';

import {
  InvestorRepository,
  PersistedWalletData, PositionRepository, WalletData, WalletRepository
} from '@gateway/data/contracts';

import PostgreSQL from '..';

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
    private investors: InvestorRepository | Factory<InvestorRepository>,
    private positions: PositionRepository | Factory<PositionRepository>,
  ) {}

  async loadWalletsDataByOwnerId(ownerId: string): Promise<WalletData[]> {
    const models = await this.db.query<WalletModel>({
      text: `${this.selectAllWhere} owner_id = $1`,
      values: [ownerId],
    });
    return Promise.all(models.map(this.modelToData));
  }

  async loadWalletDataById(id: string): Promise<WalletData> {
    if (isNaN(Number(id))) {
      throw new InvalidParameterValueError('Id can not be cast to number');
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
    const params = ids.map((id, i) => {
      if (isNaN(Number(id))) {
        throw new InvalidParameterValueError('Id can not be cast to number');
      }
      return `$${i+1}`;
    }).join(',');
    const models = await this.db.query<WalletModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(this.modelToData));
  }

  async saveNewWallet(
    walletName: string, investorId: string
  ): Promise<PersistedWalletData> {
    if (this.investors instanceof Factory) {
      this.investors = this.investors.make();
    }
    const investor = await this.investors.loadInvestorDataById(investorId);
    if (!investor) {
      throw new InvestorNotFoundError(investorId);
    }
    const [ data ] = await this.db.query<WalletData>({
      text: `INSERT INTO wallets(name, owner_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [walletName, investor.id, new Date()],
    });
    return {
      id: data.id,
      name: data.name,
      owner: investor,
    };
  }

  private async modelToData(
    {id, name, owner_id}: WalletModel
  ): Promise<WalletData> {
    if (this.positions instanceof Factory) {
      this.positions = this.positions.make();
    }
    const positions = await this.positions.loadPositionsDataByWalletId(String(id));
    return {
      id: String(id),
      name,
      ownerId: owner_id,
      positionIds: positions.map(({id}) => String(id)),
    };
  }
}
