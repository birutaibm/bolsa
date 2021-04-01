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
    const [ model ] = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} id = $1`,
      values: [id],
    });
    if (!model) {
      throw new PositionNotFoundError(id);
    }
    const [ wallet ] = await this.db.query<{id: string; name: string; owner_id: string}>({
      text: 'SELECT id, name, owner_id FROM wallets WHERE id = $1',
      values: [model.wallet_id],
    });
    const [ owner ] = await this.db.query<{id: string; name: string}>({
      text: 'SELECT id, name FROM investors WHERE id = $1',
      values: [wallet.owner_id],
    });
    const { asset, operationIds } = await this.modelToData(model);
    return { id, asset, operationIds, wallet: {
      id: wallet.id, name: wallet.name, owner: {id: owner.id, name: owner.name}
    }};
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
