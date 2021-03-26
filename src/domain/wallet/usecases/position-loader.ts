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
    const wallet = Object.assign(
      new Wallet(data.wallet.name, owner),
      { id: data.wallet.id },
    );
    const position = Object.assign(new Position(data.asset, wallet), {id});
    data.operations.forEach(({date, quantity, value, id: operationId}) =>
      Object.assign(
        new Operation(date, quantity, value, position),
        { id: operationId },
      )
    );
    return position;
  }
}
