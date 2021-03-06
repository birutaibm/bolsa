import { Types } from 'mongoose';

import { notNull } from '@utils/validators';

import Operations, { OperationDTO, OperationDocument } from '@infra/data-source/model/operation';

export class OperationRepository {
  async create(
    operation: OperationDTO, positionId: Types.ObjectId
  ): Promise<OperationDocument> {
    const registry = await Operations.create({
      position: positionId,
      date: operation.date.getTime(),
      quantity: operation.quantity,
      value: operation.value,
    });
    return await registry.save();
  }

  async load(id: Types.ObjectId): Promise<OperationDTO> {
    const model = notNull(await Operations.findById(id));
    return {
      date: new Date(model.date),
      id: model.id,
      quantity: model.quantity,
      value: model.value,
    };
  }

  static categorize(operations: OperationDTO[]) {
    const categorized: {
      existents: Array<OperationDTO & {id: Types.ObjectId;}>;
      nonExistents: OperationDTO[];
    } = { existents: [], nonExistents: [], };
    operations.forEach(operation => {
      if (operation.id) {
        categorized.existents.push({...operation, id: Types.ObjectId(operation.id)});
      } else {
        categorized.nonExistents.push({...operation});
      }
    });
    return categorized;
  }

  async update(newOp: OperationDTO & {id: Types.ObjectId}) {
    const oldOp = notNull(await Operations.findById(newOp.id));
    if (oldOp.date !== newOp.date.getTime()) {
      oldOp.date = newOp.date.getTime();
    }
    if (oldOp.quantity !== newOp.quantity) {
      oldOp.quantity = newOp.quantity;
    }
    if (oldOp.value !== newOp.value) {
      oldOp.value = newOp.value;
    }
    await oldOp.save();
  }
}
