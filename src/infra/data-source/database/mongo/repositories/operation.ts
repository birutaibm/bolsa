import { notNull } from '@utils/validators';
import { DatabaseOperationError } from '@errors/database-operation';
import { PositionNotFoundError } from '@errors/position-not-found';

import Operations, { OperationDocument } from '@infra/data-source/model/operation';
import { OperationData, OperationRepository } from '@gateway/data/contracts';
import { Positions } from '@infra/data-source/model';

import Mongo from '..';

export class MongoOperationRepository implements OperationRepository {
  constructor(
    private readonly mongo: Mongo,
  ) {}

  async loadOperationDataById(id: string): Promise<OperationData> {
    const model = notNull(await Operations.findById(id));
    return this.documentToData(model);
  }

  async loadOperationsDataByIds(ids: string[]): Promise<OperationData[]> {
    const models = await Operations.find({ _id: { $in: ids }});
    return models.map(this.documentToData);
  }

  async saveNewOperation(
    data: Omit<OperationData, 'id'>
  ): Promise<OperationData> {
    const session = await this.mongo.startSession();
    try {
      session.startTransaction()
      const position = await Positions.findById(data.positionId).session(session);
      if (!position) {
        throw new PositionNotFoundError(data.positionId);
      }
      const [operation] = await Operations.create([data], {session});
      if (!operation.id) {
        throw new DatabaseOperationError('create operation');
      }
      position.operationIds.push(operation.id);
      await position.save();
      await session.commitTransaction();
      session.endSession();
      return this.documentToData(operation);
    } catch (error) {
      return session.abortTransaction().then(() => {
        session.endSession();
        throw error;
      });
    }
  }

  private documentToData(
    { date, id, quantity, value, positionId }: OperationDocument
  ): OperationData {
    return {
      date, id, quantity, value,
      positionId: positionId.toHexString(),
    };
  }
}
