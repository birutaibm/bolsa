import { InvestorNotFoundError } from '@errors/not-found';

import {
  InvestorCreationData, InvestorDTO, InvestorRepository, RepositoryChangeCommand
} from '@gateway/data/contracts';

import { investors } from './wallet-module-data';

export class FakeInvestorRepository implements InvestorRepository<void> {
  loadInvestorDataById(id: string): InvestorDTO {
    const investor = investors.find(investor => investor.id === id);
    if (!investor) {
      throw new InvestorNotFoundError(id);
    }
    return investor;
  }

  saveNewInvestor(
    investor: InvestorCreationData
  ): RepositoryChangeCommand<InvestorDTO,void> {
    return () => {
      const created: InvestorDTO = { ...investor, walletIds: [] };
      investors.push(created);
      return created;
    };
  }
}
