import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { MayBePromise, Persisted } from '@utils/types';

import { Investor, Operation, Position, Wallet } from '@domain/wallet/entities';

import {
  OperationCreationData, OperationData,
} from './dtos';

export type NewOperationSaver = (data: OperationCreationData) =>
  MayBePromise<Persisted<OperationData>>;

export default class OperationCreator {
  constructor(
    private readonly save: NewOperationSaver,
  ) {}

  async create(
    data: OperationCreationData
  ): Promise<Persisted<Operation>> {
    if (data.quantity * data.value > 0) {
      throw new InvalidParameterValueError(
        'Quantity and value must be opposite signal numbers'
      );
    }
    const { id, position: { id: positionId, asset, wallet: {
      id: walletId, name: walletName, owner: { id: ownerId, name: ownerName }
    } } } = await this.save(data);
    const investor = new Investor(ownerId, ownerName);
    const wallet = new Wallet(walletId, walletName, investor);
    const position = new Position(positionId, asset, wallet);
    return new Operation(id, data.date, data.quantity, data.value, position);
  }
}
