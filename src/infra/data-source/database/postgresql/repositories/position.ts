import { PositionNotFoundError } from '@errors/not-found';
import { Factory } from '@utils/factory';

import {
  PositionRepository, PositionData,
  AssetRepository, OperationRepository
} from '@gateway/data/contracts';

import PostgreSQL from '..';

type PositionModel = {
  id: number;
  asset: string;
  wallet_id: number;
  created_on: Date;
};

export class PostgrePositionRepository implements PositionRepository {
  private readonly selectAllWhere = 'SELECT * FROM positions WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private operations: OperationRepository | Factory<OperationRepository>,
    private assets: AssetRepository | Factory<AssetRepository>,
  ) {}

  async loadPositionIdsByWalletId(id: string): Promise<string[]> {
    if (isNaN(Number(id))) {
      return [];
    }
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} wallet_id = $1`,
      values: [id],
    });
    return models.map(model => (String(model.id)));
  }

  async loadPositionDataById(id: string): Promise<PositionData> {
    if (isNaN(Number(id))) {
      throw new PositionNotFoundError(id);
    }
    const [ model ] = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} id = $1`,
      values: [id],
    });
    if (!model) {
      throw new PositionNotFoundError(id);
    }
    return this.modelToData(model);
  }

  async loadPositionsDataByIds(ids: string[]): Promise<PositionData[]> {
    ids = ids.filter(id => !isNaN(Number(id)));
    const params = ids.map((_, i) => `$${i+1}`).join(',');
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(model => this.modelToData(model)));
  }

  async saveNewPosition(assetId: string, walletId: string): Promise<PositionData> {
    const [ model ] = await this.db.query<PositionModel>({
      text: `INSERT INTO positions(asset, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [assetId, walletId, new Date()],
    });
    const position = await this.modelToData(model);
    return {
      ...position,
    };
  }

  private async modelToData(
    {id, asset, wallet_id}: PositionModel
  ): Promise<PositionData> {
    if (this.assets instanceof Factory) {
      this.assets = this.assets.make();
    }
    if (this.operations instanceof Factory) {
      this.operations = this.operations.make();
    }
    const operationIds = await this.operations.loadOperationIdsByPositionId(String(id));
    return {
      id: String(id),
      asset: await this.assets.loadAssetDataById(asset),
      walletId: String(wallet_id),
      operationIds,
    };
  }
}
