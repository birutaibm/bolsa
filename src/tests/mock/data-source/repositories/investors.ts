import { InvestorNotFoundError } from '@errors/not-found';

import { InvestorCreationData, InvestorDTO, InvestorRepository } from '@gateway/data/contracts';

import { investors } from './wallet-module-data';

export class FakeInvestorRepository implements InvestorRepository {
  loadInvestorDataById(id: string): InvestorDTO {
    const investor = investors.find(investor => investor.id === id);
    if (!investor) {
      throw new InvestorNotFoundError(id);
    }
    return investor;
  }

  saveNewInvestor(investor: InvestorCreationData): InvestorDTO {
    const created: InvestorDTO = { ...investor, walletIds: [] };
    investors.push(created);
    return created;
  }
}
