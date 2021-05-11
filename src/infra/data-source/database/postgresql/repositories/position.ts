import { PositionNotFoundError } from '@errors/not-found';
import { Persisted } from '@utils/types';
import { Factory } from '@utils/factory';
import { isNumber } from '@utils/validators';

import {
  PositionRepository, AssetRepository, OperationRepository,
  PositionData, PositionWithWalletData, RepositoryChangeCommand
} from '@gateway/data/contracts';

import PostgreSQL, { Executor } from '..';
import asset from '@infra/data-source/model/asset';

type PositionModel = {
  id: number;
  asset_id: string;
  wallet_id: number;
  created_on: Date;
};

type Asset = {id: string; name: string, ticker: string};

type AssetWithLastPrice = Asset & { lastPrice?: {
  date: Date; price: number;
}};

export class PostgrePositionRepository implements PositionRepository<Executor<PositionModel>> {
  private readonly selectAllWhere = 'SELECT * FROM positions WHERE';

  constructor(
    private readonly db: PostgreSQL,
    private operations: OperationRepository | Factory<OperationRepository>,
  ) {}

  async loadPositionWithWalletAndOwnerById(id: string): Promise<Persisted<PositionWithWalletData>> {
    if (!isNumber(id)) {
      throw new PositionNotFoundError(id);
    }
    const [ data ] = await this.db.query<{
      asset_id: string; ticker: string; asset_name: string;
      wallet_id: number; wallet_name: string;
      owner_id: string; owner_name: string;
    }>({
      text: `SELECT
                p.asset_id, a.ticker, a.name asset_name,
                w.id wallet_id, w.name wallet_name, w.owner_id,
                i.name owner_name
             FROM positions p
             INNER JOIN assets a ON p.asset_id = a.id
             INNER JOIN wallets w ON p.wallet_id = w.id
             INNER JOIN investors i ON i.id = w.owner_id
             WHERE p.id = $1`,
      values: [id],
    });
    if (!data) {
      throw new PositionNotFoundError(id);
    }
    const asset = await this.fillAssetLastPrice({
      id: data.asset_id,
      ticker: data.ticker,
      name: data.asset_name || data.ticker,
    });
    if (this.operations instanceof Factory) {
      this.operations = this.operations.make();
    }
    const operationIds = await this.operations.loadOperationIdsByPositionId(id);
    return { id, asset, operationIds, wallet: {
      id: String(data.wallet_id), name: data.wallet_name, owner: {
        id: data.owner_id, name: data.owner_name,
    }}};
  }

  private async fillAssetLastPrice(asset: Asset): Promise<AssetWithLastPrice> {
    try {
      const [ lastPrice ] = await this.db.query<{
        date: Date; price: number;
      }>({
        text: `SELECT
                  date, close price
               FROM prices
               WHERE asset_id = $1 ORDER BY date DESC LIMIT 1`,
        values: [asset.id],
      });
      if (lastPrice) {
        return { ...asset, lastPrice };
      }
    } catch (error) {
    }
    return { ...asset };
  }

  async loadPositionIdsByWalletId(id: string): Promise<string[]> {
    if (!isNumber(id)) {
      return [];
    }
    const models = await this.db.query<{id: string}>({
      text: `SELECT id FROM positions WHERE wallet_id = $1`,
      values: [id],
    });
    return models.map(({id}) => id.toString());
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
      text: `INSERT INTO positions(asset_id, wallet_id, created_on)
      VALUES ($1, $2, $3) RETURNING *`,
      values: [assetId, walletId, new Date()],
    };
    const translate = ([data]: PositionModel[]) => this.modelToData(data, true);
    return async executor => translate((await executor(query)).rows);
  }

  private async loadAssetDataById(assetId: string): Promise<AssetWithLastPrice> {
    const [ { ticker, name, date, price, } ] = await this.db.query<{
      ticker: string; name: string; date?: Date; price?: number;
    }>({
      text: `SELECT ticker, name, p.date, p.close price FROM assets
              LEFT JOIN prices p ON p.asset_id = assets.id
              WHERE assets.id = $1 ORDER BY p.date DESC LIMIT 1`,
      values: [assetId]
    });
    const asset = { id: assetId, ticker, name: name || ticker };
    return date && price ? { ...asset, lastPrice: { date, price } } : asset;
  }

  private async modelToData(
    {id, asset_id: assetId, wallet_id}: PositionModel,
    translateOnly = false,
  ): Promise<PositionData> {
    let operationIds: string[] = [];
    if (!translateOnly) {
      if (this.operations instanceof Factory) {
        this.operations = this.operations.make();
      }
      operationIds = await this.operations.loadOperationIdsByPositionId(String(id));
    }
    return {
      id: String(id),
      asset: await this.loadAssetDataById(assetId),
      walletId: String(wallet_id),
      operationIds,
    };
  }
}
