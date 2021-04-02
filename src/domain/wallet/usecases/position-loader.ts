import { MayBePromise, Persisted } from '@utils/types';

import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';

import { CheckLoggedUserId, PopulatedPositionData } from './dtos';

export type PositionDataLoader =
  (id: string, isLogged: CheckLoggedUserId) => MayBePromise<Persisted<PopulatedPositionData>>;

export default class PositionLoader {
  constructor(
    private readonly loadData: PositionDataLoader,
  ) {}

  async load(id: string, isLogged: CheckLoggedUserId): Promise<Persisted<Position>> {
    const data = await this.loadData(id, isLogged);
    const owner = new Investor(data.wallet.owner.id, data.wallet.owner.name);
    const wallet = new Wallet(data.wallet.id, data.wallet.name, owner);
    const position = new Position(id, data.asset, wallet);
    data.operations.forEach(({date, quantity, value, id: operationId}) =>
      new Operation(operationId, date, quantity, value, position)
    );
    return position;
  }
}
