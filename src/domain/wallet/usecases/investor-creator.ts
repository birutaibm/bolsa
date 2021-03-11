import { Investor } from '@domain/wallet/entities';
import { SignInRequiredError } from '@errors/sign-in-required';

import { InvestorData, MayBePromise, Persisted } from './dtos';

export type InvestorPersistedData = InvestorData & { walletIds: string[] };
export type NewInvestorSaver = (investor: InvestorData) =>
  MayBePromise<InvestorPersistedData>;

export default class InvestorCreator {
  constructor(
    private readonly save: NewInvestorSaver,
  ) {}

  async create({id, name}: InvestorData, loggedUserId: string): Promise<Persisted<Investor>> {
    if (loggedUserId !== id) {
      throw new SignInRequiredError();
    }
    await this.save({id, name});
    return new Investor(id, name);
  }
}
