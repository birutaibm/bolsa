import { InvestorNotFoundError } from '@errors/not-found';

import {
  InvestorCreationData,
  InvestorData, InvestorRepository, WalletRepository
} from '@gateway/data/contracts';
import { Factory } from '@utils/factory';

import PostgreSQL from '..';

type InvestorModel = {
  created_on: Date;
  id: number;
  name: string;
};

export class PostgreInvestorRepository implements InvestorRepository {
  constructor(
    private readonly db: PostgreSQL,
    private wallets: WalletRepository | Factory<WalletRepository>
  ) {}

  async loadInvestorDataById(id: string): Promise<InvestorData> {
    const [ model ] = await this.db.query<InvestorModel>({
      text: 'SELECT * FROM investors WHERE id = $1',
      values: [id],
    });
    if (!model) {
      throw new InvestorNotFoundError(id);
    }
    return this.modelToData(model);
  }

  async saveNewInvestor(investor: InvestorCreationData): Promise<InvestorData> {
    const existents = await this.db.query<InvestorModel>({
      text: 'SELECT * FROM investors WHERE id = $1',
      values: [investor.id],
    });
    if (existents.length > 0) {
      return this.modelToData(existents[0]);
    }
    const [ model ] = await this.db.query<InvestorModel>({
      text: `INSERT INTO investors(id, name, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [investor.id, investor.name, new Date()],
    });
    return this.modelToData(model);
  }

  private async modelToData(
    {id, name}: InvestorModel
  ): Promise<InvestorData> {
    if (this.wallets instanceof Factory) {
      this.wallets = this.wallets.make();
    }
    const wallets = await this.wallets.loadWalletsDataByOwnerId(String(id));
    return {
      id: String(id),
      name,
      walletIds: wallets.map(wallet => wallet.id),
    };
  }
}
