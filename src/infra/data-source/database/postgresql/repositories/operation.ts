import { OperationNotFoundError } from '@errors/not-found';
import { isNumber } from '@utils/validators';

import {
  OperationRepository, OperationData, RepositoryChangeCommand
} from '@gateway/data/contracts';

import PostgreSQL, { Executor } from '..';

type OperationModel = {
  id: number;
  date: Date;
  quantity: number;
  value: string;
  position_id: number;
  created_on: Date;
};

export class PostgreOperationRepository implements OperationRepository<Executor<OperationModel>> {
  private readonly selectAllWhere = 'SELECT * FROM operations WHERE';

  constructor(
    private readonly db: PostgreSQL,
  ) {}

  async loadOperationIdsByPositionId(id: string): Promise<string[]> {
    if (!isNumber(id)) {
      return [];
    }
    const models = await this.db.query<OperationModel>({
      text: `${this.selectAllWhere} position_id = $1`,
      values: [id],
    });
    return models.map(model => String(model.id));
  }

  async loadOperationDataById(id: string): Promise<OperationData> {
    if (!isNumber(id)) {
      throw new OperationNotFoundError(id);
    }
    const [ model ] = await this.db.query<OperationModel>({
      text: `${this.selectAllWhere} id = $1`,
      values: [id],
    });
    if (!model) {
      throw new OperationNotFoundError(id);
    }
    return this.modelToData(model);
  }

  async loadOperationsDataByIds(ids: string[]): Promise<OperationData[]> {
    ids = ids.filter(id => isNumber(id));
    const params = ids.map((_, i) => `$${i+1}`).join(',');
    const models = await this.db.query<OperationModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(model => this.modelToData(model)));
  }

  saveNewOperation(
    data: Omit<OperationData, 'id'>
  ): RepositoryChangeCommand<OperationData, Executor<OperationModel>> {
    const query = {
      text: `INSERT INTO
        operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [data.date, data.quantity, data.value, data.positionId, new Date()],
    };
    const translate = ([data]: OperationModel[]) => this.modelToData(data);
    return async executor => translate((await executor(query)).rows);
  }

  private async modelToData(
    {id, date, quantity, value, position_id}: OperationModel
  ): Promise<OperationData> {
    return {
      date, quantity, value: Number(value),
      id: String(id),
      positionId: String(position_id),
    };
  }
}
