import { MayBePromise, Persisted } from '@utils/types';

import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';

import { CheckLoggedUserId, PopulatedWalletData } from './dtos';

export type WalletDataLoader =
  (id: string, isLogged: CheckLoggedUserId) => MayBePromise<Persisted<PopulatedWalletData>>;

export default class WalletLoader {
  constructor(
    private readonly loadData: WalletDataLoader,
  ) {}

  async load(
    id: string, isLogged: CheckLoggedUserId
  ): Promise<Persisted<Wallet>> {
    const data = await this.loadData(id, isLogged);
    const owner = new Investor(data.owner.id, data.owner.name);
    const wallet = new Wallet(data.name, owner);
    data.positions.forEach(position => {
      const pos = new Position(position.asset, wallet);
      position.operations.forEach(({date, quantity, value}) =>
        new Operation(date, quantity, value, pos)
      );
    });
    return Object.assign(wallet, {id});
  }
}
