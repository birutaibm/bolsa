import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { MayBePromise, Persisted } from '@utils/types';

import { Operation, Position } from '@domain/wallet/entities';

import { CheckLoggedUserId, OperationCreationData } from './dtos';
import PositionLoader from './position-loader';
import PositionCreator from './position-creator';

export type NewOperationSaver = (
  date: Date, quantity: number, value: number, positionId: string,
) => MayBePromise<string>;

export default class OperationCreator {
  constructor(
    private readonly save: NewOperationSaver,
    private readonly positions: PositionLoader,
    private readonly positionCreator: PositionCreator,
  ) {}

  async create(
    {date, quantity, value, isLogged, ...data}: OperationCreationData
  ): Promise<Persisted<Operation>> {
    if (quantity * value > 0) {
      throw new InvalidParameterValueError(
        'Quantity and value must be opposite signal numbers'
      );
    }
    const position = await this.getPosition(data, isLogged);
    const operation = new Operation(date, quantity, value, position)
    const id = await this.save(date, quantity, value, position.id);
    return Object.assign(operation, {id});
  }

  //TODO: improve this flow
  private async getPosition(
    data: { positionId: string; assetId?: string; walletId?: string; }
        | { positionId?: string; assetId: string; walletId: string; },
    isLogged: CheckLoggedUserId,
  ): Promise<Persisted<Position>> {
    if (data.positionId) {
      return await this.positions.load(data.positionId, isLogged);
    }
    if (data.assetId && data.walletId) {
      return await this.positionCreator.create(data.assetId, data.walletId, isLogged);
    }
    throw new Error('Wrong parameter: need positionId or both assetId and walletId.');
  }
}

