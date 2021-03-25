import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';

import { MayBePromise, Persisted, PopulatedPositionData } from './dtos';

export type PositionDataLoader =
  (id: string, loggedUserId: string) => MayBePromise<Persisted<PopulatedPositionData>>;

export default class PositionLoader {
  constructor(
    private readonly loadData: PositionDataLoader,
  ) {}

  async load(id: string, loggedUserId: string): Promise<Persisted<Position>> {
    const data = await this.loadData(id, loggedUserId);
    const owner = new Investor(data.wallet.owner.id, data.wallet.owner.name);
    const wallet = new Wallet(data.wallet.name, owner);
    const position = new Position(data.asset, wallet);
    data.operations.forEach(({date, quantity, value}) =>
      new Operation(date, quantity, value, position)
    );
    return Object.assign(position, {id});
  }
}