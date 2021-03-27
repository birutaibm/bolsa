import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { MayBePromise, Persisted } from '@utils/types';

import { Operation, Position } from '@domain/wallet/entities';

import { CheckLoggedUserId, OperationCreationData, PositionCreationData } from './dtos';
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
    {date, quantity, value, ...data}: OperationCreationData
  ): Promise<Persisted<Operation>> {
    if (quantity * value > 0) {
      throw new InvalidParameterValueError(
        'Quantity and value must be opposite signal numbers'
      );
    }
    const position = await this.getPosition(data);
    const operation = new Operation(date, quantity, value, position)
    const id = await this.save(date, quantity, value, position.id);
    return Object.assign(operation, {id});
  }

  private async getPosition(
    data: { positionId: string; isLogged: CheckLoggedUserId; }
        | PositionCreationData,
  ): Promise<Persisted<Position>> {
    if ('positionId' in data) {
      return await this.positions.load(data.positionId, data.isLogged);
    }
    return await this.positionCreator.create(data);
  }
}

