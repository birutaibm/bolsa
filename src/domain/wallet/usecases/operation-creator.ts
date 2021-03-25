import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { MayBePromise, Persisted } from '@utils/types';

import { Operation } from '@domain/wallet/entities';

import { CheckLoggedUserId } from './dtos';
import PositionLoader from './position-loader';

export type NewOperationSaver = (
  date: Date, quantity: number, value: number, positionId: string,
) => MayBePromise<string>;

export default class OperationCreator {
  constructor(
    private readonly save: NewOperationSaver,
    private readonly positions: PositionLoader,
  ) {}

  async create(
    date: Date, quantity: number, value: number, positionId: string, isLogged: CheckLoggedUserId
  ): Promise<Persisted<Operation>> {
    if (quantity * value > 0) {
      throw new InvalidParameterValueError(
        'Quantity and value must be opposite signal numbers'
      );
    }
    const position = await this.positions.load(positionId, isLogged);
    const operation = new Operation(date, quantity, value, position)
    const id = await this.save(date, quantity, value, positionId);
    return Object.assign(operation, {id});
  }
}
