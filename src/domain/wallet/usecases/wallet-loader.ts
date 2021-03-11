import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';
import { MayBePromise, Persisted, PopulatedWalletData } from './dtos';

export type WalletDataLoader =
  (id: string, loggedUserId: string) => MayBePromise<Persisted<PopulatedWalletData>>;

export default class WalletLoader {
  constructor(
    private readonly loadData: WalletDataLoader,
  ) {}

  async load(
    id: string, loggedUserId: string
  ): Promise<Persisted<Wallet>> {
    const data = await this.loadData(id, loggedUserId);
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
