import { PositionNotFoundError } from '@errors/not-found';
import { Persisted } from '@utils/types';
import { Factory } from '@utils/factory';
import { isNumber } from '@utils/validators';

import {
  PositionRepository, AssetRepository, OperationRepository,
  PositionData, PositionWithWalletData, RepositoryChangeCommand
} from '@gateway/data/contracts';

import PostgreSQL, { Executor } from '..';

type PositionModel = {
  id: number;
  asset: string;
  wallet_id: number;
  created_on: Date;
};

export class PostgrePositionRepository implements PositionRepository<Executor<PositionModel>> {
  private readonly selectAllWhere = 'SELECT * FROM positions WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private operations: OperationRepository | Factory<OperationRepository>,
    private assets: AssetRepository | Factory<AssetRepository>,
  ) {}

  async loadPositionWithWalletAndOwnerById(id: string): Promise<Persisted<PositionWithWalletData>> {
    if (!isNumber(id)) {
      throw new PositionNotFoundError(id);
    }
    if (this.assets instanceof Factory) {
      this.assets = this.assets.make();
    }
    const data = await this.db.query<{
      asset_id: string; walletId: string; walletName: string; ownerId: string; ownerName: string; operationId: string;
    }>({
      text: `SELECT
                p.asset_id, w.name walletName, i.id ownerId, i.name ownerName, o.id operationId
             FROM positions p
             INNER JOIN operations o ON o.position_id = p.id
             INNER JOIN wallets w ON p.wallet_id = w.id
             INNER JOIN investors i ON i.id = w.owner_id
             WHERE p.id = $1`,
      values: [id],
    });
    if (data.length === 0) {
      throw new PositionNotFoundError(id);
    }
    const asset = await this.assets.loadAssetDataById(data[0].asset_id);
    const operationIds = data.map(({operationId}) => operationId);
    return { id, asset, operationIds, wallet: {
      id: data[0].walletId, name: data[0].walletName, owner: {
        id: data[0].ownerId, name: data[0].ownerName
    }}};
  }

  async loadPositionIdsByWalletId(id: string): Promise<string[]> {
    if (!isNumber(id)) {
      return [];
    }
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} wallet_id = $1`,
      values: [id],
    });
    return models.map(model => (String(model.id)));
  }

  async loadPositionDataById(id: string): Promise<PositionData> {
    if (!isNumber(id)) {
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
    ids = ids.filter(id => isNumber(id));
    const params = ids.map((_, i) => `$${i+1}`).join(',');
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(model => this.modelToData(model)));
  }

  saveNewPosition(
    assetId: string, walletId: string
  ): RepositoryChangeCommand<PositionData, Executor<PositionModel>> {
    const query = {
      text: `INSERT INTO positions(asset, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [assetId, walletId, new Date()],
    };
    const translate = ([data]: PositionModel[]) => this.modelToData(data, true);
    return async executor => translate((await executor(query)).rows);
  }

  private async modelToData(
    {id, asset, wallet_id}: PositionModel,
    translateOnly = false,
  ): Promise<PositionData> {
    if (this.assets instanceof Factory) {
      this.assets = this.assets.make();
    }
    let operationIds: string[] = [];
    if (!translateOnly) {
      if (this.operations instanceof Factory) {
        this.operations = this.operations.make();
      }
      operationIds = await this.operations.loadOperationIdsByPositionId(String(id));
    }
    return {
      id: String(id),
      asset: await this.assets.loadAssetDataById(asset),
      walletId: String(wallet_id),
      operationIds,
    };
  }
}
