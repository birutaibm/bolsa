import { SignInRequiredError } from '@errors/sign-in-required';

import { Position, Wallet, Investor, Operation } from '@domain/wallet/entities';

import { MayBePromise, Persisted, PopulatedInvestorData } from './dtos';

export type PopulatedInvestorDataLoader = (id: string) => MayBePromise<PopulatedInvestorData>;

export default class InvestorLoader {
  constructor(
    private readonly loadData: PopulatedInvestorDataLoader,
  ) {}

  async load(id: string, loggedUserId: string): Promise<Persisted<Investor>> {
    if (loggedUserId !== id) {
      throw new SignInRequiredError();
    }
    const data = await this.loadData(id);
    const investor = new Investor(data.id, data.name);
    data.wallets.forEach(walletData => {
      const wallet = new Wallet(walletData.name, investor);
      walletData.positions.forEach(posData => {
        const position = new Position(posData.asset, wallet);
        posData.operations.forEach(({date, quantity, value}) =>
          new Operation(date, quantity, value, position)
        );
      });
    });
    return investor;
  }
}
