import { OperationData, OperationRepository } from '@gateway/data/contracts';

import { operations, positions } from './wallet-module-data';

export class FakeOperationRepository implements OperationRepository {
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
    return operations[index];
  }

  loadOperationsDataByIds(ids: string[]): OperationData[] {
    return ids.map(this.loadOperationDataById);
  }
}
