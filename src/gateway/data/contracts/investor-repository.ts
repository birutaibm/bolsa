import { MayBePromise, PopulatedInvestorData } from '@domain/wallet/usecases/dtos';

export type InvestorDTO = {
  id: string;
  name: string;
  walletIds: string[];
};

export type InvestorData = InvestorDTO;

export type InvestorCreationData = {
  id: string;
  name: string;
};

export type PopulatedInvestorDTO = PopulatedInvestorData;

export interface InvestorRepository {
  loadInvestorDataById(id: string): MayBePromise<InvestorDTO>;
  saveNewInvestor(investor: InvestorCreationData): MayBePromise<InvestorDTO>;
}
