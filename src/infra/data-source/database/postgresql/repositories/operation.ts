import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { OperationNotFoundError, PositionNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';

import { OperationRepository, OperationData, PositionRepository } from '@gateway/data/contracts';

import PostgreSQL from '..';

type OperationModel = {
  id: number;
  date: Date;
  quantity: number;
  value: string;
  position_id: number;
  created_on: Date;
};

export class PostgreOperationRepository implements OperationRepository {
  private readonly selectAllWhere = 'SELECT * FROM operations WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private positions: PositionRepository | Factory<PositionRepository>,
  ) {}

  async loadOperationsDataByPositionId(id: string): Promise<OperationData[]> {
    if (isNaN(Number(id))) {
      throw new InvalidParameterValueError('Position id can not be cast to number');
    }
    const models = await this.db.query<OperationModel>({
      text: `${this.selectAllWhere} position_id = $1`,
      values: [id],
    });
    return Promise.all(models.map(this.modelToData));
  }

  async loadOperationDataById(id: string): Promise<OperationData> {
    if (isNaN(Number(id))) {
      throw new InvalidParameterValueError('Id can not be cast to number');
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
    const params = ids.map((id, i) => {
      if (isNaN(Number(id))) {
        throw new InvalidParameterValueError('Id can not be cast to number');
      }
      return `$${i+1}`;
    }).join(',');
    const models = await this.db.query<OperationModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(this.modelToData));
  }

  async saveNewOperation(
    data: Omit<OperationData, 'id'>
  ): Promise<OperationData> {
    if (this.positions instanceof Factory) {
      this.positions = this.positions.make();
    }
    const position = await this.positions.loadPositionDataById(data.positionId);
    if (!position) {
      throw new PositionNotFoundError(data.positionId);
    }
    const [ model ] = await this.db.query<OperationModel>({
      text: `INSERT INTO
        operations(date, quantity, value, position_id, created_on)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [data.date, data.quantity, data.value, data.positionId, new Date()],
    });
    return this.modelToData(model);
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
