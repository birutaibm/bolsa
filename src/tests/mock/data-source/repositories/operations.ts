import { MayBePromise } from '@domain/wallet/usecases/dtos';
import { OperationNotFoundError } from '@errors/not-found';
import { OperationData, OperationRepository } from '@gateway/data/contracts';

import { operations, positions } from './wallet-module-data';

export class FakeOperationRepository implements OperationRepository {
  loadOperationIdsByPositionId(id: string): MayBePromise<string[]> {
    return operations
      .filter(operation => operation.positionId === id)
      .map(operation => operation.id);
  }

  saveNewOperation(data: Omit<OperationData, "id">): OperationData {
    const id = String(operations.length);
    const operation = { ...data, id };
    positions.find(position => position.id === data.positionId)?.operationIds
      .push(id);
    operations.push(operation);
    return operation;
  }

  loadOperationDataById(id: string): OperationData {
    const index = Number(id);
    if (Number.isNaN(index)) {
      throw new OperationNotFoundError(id);
    }
    return operations[index];
  }

  loadOperationsDataByIds(ids: string[]): OperationData[] {
    return ids.map(this.loadOperationDataById);
  }
}
