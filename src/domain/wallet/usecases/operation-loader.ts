import { MayBePromise, Persisted } from '@utils/types';

import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';

import { CheckLoggedUserId, OperationData } from './dtos';

export type OperationDataLoader =
  (id: string, isLogged: CheckLoggedUserId) => MayBePromise<Persisted<OperationData>>;

export default class OperationLoader {
  constructor(
    private readonly loadData: OperationDataLoader,
  ) {}

  async load(id: string, isLogged: CheckLoggedUserId): Promise<Persisted<Operation>> {
    const { date, quantity, value, position: data } = await this.loadData(id, isLogged);
    const owner = new Investor(data.wallet.owner.id, data.wallet.owner.name);
    const wallet = new Wallet(data.wallet.id, data.wallet.name, owner);
    const position = new Position(data.id, data.asset, wallet);
    return new Operation(id, date, quantity, value, position);
  }
}
