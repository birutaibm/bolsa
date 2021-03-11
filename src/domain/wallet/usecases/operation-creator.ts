import { Operation } from '@domain/wallet/entities';
import { MayBePromise, OperationData, Persisted } from './dtos';
import PositionLoader from './position-loader';

export type NewOperationSaver = (
  date: Date, quantity: number, value: number, positionId: string, loggedUserId: string
) => MayBePromise<Persisted<OperationData>>;

export default class OperationCreator {
  constructor(
    private readonly save: NewOperationSaver,
    private readonly positions: PositionLoader,
  ) {}

  async create(
    date: Date, quantity: number, value: number, positionId: string, loggedUserId: string
  ): Promise<Persisted<Operation>> {
    const position = await this.positions.load(positionId, loggedUserId);
    const operation = new Operation(date, quantity, value, position)
    const { id } = await this.save(date, quantity, value, positionId, loggedUserId);
    return Object.assign(operation, {id});
  }
}
