import { InvestorNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';

import {
  InvestorCreationData,
  InvestorData, InvestorRepository, RepositoryChangeCommand, WalletRepository
} from '@gateway/data/contracts';

import PostgreSQL, { Executor } from '..';

type InvestorModel = {
  created_on: Date;
  id: number;
  name: string;
};

export class PostgreInvestorRepository implements InvestorRepository<Executor<InvestorModel>> {
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

  saveNewInvestor(investor: InvestorCreationData): RepositoryChangeCommand<InvestorData, Executor<InvestorModel>> {
    const find = {
      text: 'SELECT * FROM investors WHERE id = $1',
      values: [investor.id],
    };
    const create = {
      text: `INSERT INTO investors(id, name, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [investor.id, investor.name, new Date()],
    };
    return async (executor: Executor<InvestorModel>) => {
      const { rows: existents } = await executor(find);
      if (existents.length > 0) {
        return this.modelToData(existents[0]);
      }
      const { rows: [ model ]} = await executor(create);
      return this.modelToData(model);
    }
  }

  private async modelToData(
    {id, name}: InvestorModel
  ): Promise<InvestorData> {
    if (this.wallets instanceof Factory) {
      this.wallets = this.wallets.make();
    }
    const walletIds = await this.wallets.loadWalletIdsByOwnerId(String(id));
    return {
      id: String(id),
      name,
      walletIds,
    };
  }
}
