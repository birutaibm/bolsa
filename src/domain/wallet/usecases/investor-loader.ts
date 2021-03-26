import { MayBePromise } from '@utils/types';

import { Position, Wallet, Investor, Operation } from '@domain/wallet/entities';

import { PopulatedInvestorData } from './dtos';

export type PopulatedInvestorDataLoader =
  (id: string) => MayBePromise<PopulatedInvestorData>;

export default class InvestorLoader {
  constructor(
    private readonly loadData: PopulatedInvestorDataLoader,
  ) {}

  async load(id: string): Promise<Investor> {
    const data = await this.loadData(id);
    const investor = new Investor(data.id, data.name);
    data.wallets.forEach(walletData => {
      const wallet = Object.assign(
        new Wallet(walletData.name, investor),
        { id: walletData.id, },
      );
      walletData.positions.forEach(posData => {
        const position = Object.assign(
          new Position(posData.asset, wallet),
          { id: posData.id, },
        );
        posData.operations.forEach(({date, quantity, value, id: operationId}) =>
          Object.assign(
            new Operation(date, quantity, value, position),
            { id: operationId, },
          )
        );
      });
    });
    return investor;
  }
}
