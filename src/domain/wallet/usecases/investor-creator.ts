import { SignInRequiredError } from '@errors/sign-in-required';

import { Investor } from '@domain/wallet/entities';

import { InvestorData, MayBePromise, Persisted } from './dtos';

export type InvestorPersistedData = InvestorData & { walletIds: string[] };
export type NewInvestorSaver = (investor: InvestorData) =>
  MayBePromise<InvestorPersistedData>;

export default class InvestorCreator {
  constructor(
    private readonly save: NewInvestorSaver,
  ) {}

  async create({id, name}: InvestorData): Promise<Persisted<Investor>> {
    await this.save({id, name});
    return new Investor(id, name);
  }
}
