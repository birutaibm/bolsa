import { MayBePromise } from '@domain/wallet/usecases/dtos';
import { InvestorCreationData, InvestorDTO, InvestorRepository } from '@gateway/data/contracts';
import { investors } from './wallet-module-data';

export class FakeInvestorRepository implements InvestorRepository {
  loadInvestorDataById(id: string): MayBePromise<InvestorDTO> {
    const index = Number(id);
    return investors[index];
  }

  saveNewInvestor(investor: InvestorCreationData): MayBePromise<InvestorDTO> {
    const created: InvestorDTO = { ...investor, walletIds: [] };
    investors.push(created);
    return created;
  }
}
