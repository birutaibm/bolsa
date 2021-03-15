import { AssetNotFoundError } from '@errors/asset-not-found';
import { PositionNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { Factory } from '@utils/factory';

import {
  PositionRepository, PositionData, PositionWithWalletData,
  AssetRepository, WalletRepository, OperationRepository
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
    private wallets: WalletRepository | Factory<WalletRepository>,
    private operations: OperationRepository | Factory<OperationRepository>,
    private assets: AssetRepository | Factory<AssetRepository>,
  ) {}

  async loadPositionsDataByWalletId(id: string): Promise<PositionData[]> {
    if (isNaN(Number(id))) {
      throw new InvalidParameterValueError('Wallet id can not be cast to number');
    }
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} wallet_id = $1`,
      values: [id],
    });
    return Promise.all(models.map(this.modelToData));
  }

  async loadPositionDataById(id: string): Promise<PositionData> {
    if (isNaN(Number(id))) {
      throw new InvalidParameterValueError('Id can not be cast to number');
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
    const params = ids.map((id, i) => {
      if (isNaN(Number(id))) {
        throw new InvalidParameterValueError('Id can not be cast to number');
      }
      return `$${i+1}`;
    }).join(',');
    const models = await this.db.query<PositionModel>({
      text: `${this.selectAllWhere} id IN (${params})`,
      values: ids,
    });
    return Promise.all(models.map(this.modelToData));
  }

  async saveNewPosition(assetId: string, walletId: string): Promise<PositionWithWalletData> {
    if (this.wallets instanceof Factory) {
      this.wallets = this.wallets.make();
    }
    const wallet = await this.wallets.loadWalletDataById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }

    if (this.assets instanceof Factory) {
      this.assets = this.assets.make();
    }
    const asset = await this.assets.loadAssetDataById(assetId);
    if (!asset) {
      throw new AssetNotFoundError(assetId);
    }

    const [ model ] = await this.db.query<PositionModel>({
      text: `INSERT INTO positions(asset, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [asset.id, wallet.id, new Date()],
    });
    const position = await this.modelToData(model);
    return {
      ...position,
      wallet,
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
    const operations = await this.operations.loadOperationsDataByPositionId(String(id));
    return {
      id: String(id),
      asset: await this.assets.loadAssetDataById(asset),
      walletId: String(wallet_id),
      operationIds: operations.map(operation => String(operation.id)),
    };
  }
}
