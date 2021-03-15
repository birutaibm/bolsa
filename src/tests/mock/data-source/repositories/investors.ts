import { InvestorCreationData, InvestorDTO, InvestorRepository } from '@gateway/data/contracts';

import { investors } from './wallet-module-data';

export class FakeInvestorRepository implements InvestorRepository {
  loadInvestorDataById(id: string): InvestorDTO {
    const index = Number(id);
    return investors[index];
  }

  saveNewInvestor(investor: InvestorCreationData): InvestorDTO {
    const created: InvestorDTO = { ...investor, walletIds: [] };
    investors.push(created);
    return created;
  }
}
