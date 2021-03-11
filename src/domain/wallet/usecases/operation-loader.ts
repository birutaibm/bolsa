import { Operation, Position, Wallet, Investor } from '@domain/wallet/entities';

import { MayBePromise, OperationData, Persisted } from './dtos';

export type OperationDataLoader =
  (id: string, loggedUserId: string) => MayBePromise<Persisted<OperationData>>;

export default class WalletLoader {
  constructor(
    private readonly loadData: OperationDataLoader,
  ) {}

  async load(id: string, loggedUserId: string): Promise<Persisted<Operation>> {
    const { date, quantity, value, position: data } = await this.loadData(id, loggedUserId);
    const owner = new Investor(data.wallet.owner.id, data.wallet.owner.name);
    const wallet = new Wallet(data.wallet.name, owner);
    const position = new Position(data.asset, wallet);
    const operation = new Operation(date, quantity, value, position);
    return Object.assign(operation, {id});
  }
}
