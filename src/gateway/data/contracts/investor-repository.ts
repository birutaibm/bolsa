import { MayBePromise } from '@utils/types';
import { PopulatedInvestorData } from '@domain/wallet/usecases/dtos';
import { RepositoryChangeCommand } from './repository-change-command';

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

export interface InvestorRepository<E=any> {
  loadInvestorDataById(id: string): MayBePromise<InvestorDTO>;
  saveNewInvestor(
    investor: InvestorCreationData
  ): RepositoryChangeCommand<InvestorDTO,E>;
}
