import {
  AssetNotFoundError, ExternalSymbolNotFoundError
} from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';
import { Persisted } from '@utils/types';

import { AssetData, InternalPriceRepository } from '@gateway/data/contracts';
import {
  AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO,
} from '@gateway/data/dto';

import PostgreSQL from '..';

export class PostgrePriceRepository implements InternalPriceRepository {
  constructor(
    private readonly db: PostgreSQL
  ) {}

  private async getOrCreateAsset(ticker: string): Promise<{id: string; name?: string;}> {
    let [ asset ] = await this.db.query<{id: string; name?: string;}>({
      text: `SELECT id FROM assets WHERE ticker = $1`,
      values: [ticker],
    });
    if (!asset) {
      [ asset ] = await this.db.query<{id: string; name?: string;}>({
        text: `INSERT INTO assets(created_on, ticker) VALUES($1, $2)
               RETURNING id, name`,
        values: [new Date(), ticker],
      });
    }
    return asset;
  }

  async registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Promise<Persisted<SymbolDictionaryEntryDTO>> {
    const { id } = await this.getOrCreateAsset(ticker);
    await this.db.query({
      text: `insert into
        external_price_symbols(asset_id, source, symbol) values($1, $2, $3)
        on conflict (asset_id, source) do update set symbol = $3`,
      values: [id, source, externalSymbol],
    });
    return { ticker, source, externalSymbol, id };
  }

  async getExternalSymbol(
    ticker: string, externalLibrary: string
  ): Promise<string> {
    const [ response ] = await this.db.query<{symbol: string}>({
      text: `SELECT symbol FROM external_price_symbols e
              INNER JOIN assets ON e.asset_id = assets.id
              WHERE assets.ticker = $1 AND e.source = $2`,
      values: [ticker, externalLibrary],
    });
    if (!response) {
      throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
    }
    return response.symbol;
  }

  async save(ticker: string, prices: PriceDTO[]): Promise<Persisted<AssetPriceDTO>[]> {
    const { id, name } = await this.getOrCreateAsset(ticker);
    const createdOn = `'${new Date().toISOString()}'`;
    const values = prices.map(price => [
        `'${id}'`, createdOn, `'${price.date.toISOString()}'`,
        price.open, price.close, price.min, price.max
      ].join(', ')).map(price => `(${price})`).join(', ');
    await this.db.query({
      text: `insert into
              prices(asset_id, created_on, date, open, close, low, high)
              values${values}`,
    });
    return prices.map(price => ({
      ...price, ticker, name: name || ticker, id,
    }));
  }

  async loadPriceByTicker(ticker: string): Promise<AssetPriceDTO[]> {
    try {
      const data = await this.db.query<{
        ticker: string; name?: string; date: Date;
        open: number; close: number; low: number; high: number
      }>({
        text: `SELECT
                assets.ticker, assets.name, p.date, p.open, p.close, p.low, p.high
               FROM prices p INNER JOIN assets ON p.asset_id = assets.id
               WHERE assets.ticker = $1`,
        values: [ticker],
      });
      console.log({ticker, data});
      if (data.length !== 0) {
        return data.map(price => ({
          ticker: price.ticker,
          name: price.name || price.ticker,
          date: price.date,
          open: price.open,
          close: price.close,
          min: price.low,
          max: price.high,
        }));
      }
    } catch (error) {
      throw new PriceUnavailableError(ticker, error);
    }
    throw new AssetNotFoundError(ticker);
  }

  async loadAssetDataById(id: string): Promise<AssetData> {
    const [ asset ] = await this.db.query<{
      ticker: string; name?: string;
    }>({
      text: `select ticker, name from assets where id = $1`,
      values: [id],
    });
    if (!asset) {
      throw new AssetNotFoundError(id);
    }
    const prices = await this.db.query<{
      date: Date;
      open: number;
      close: number;
      low: number;
      high: number;
    }>({
      text: `select date, open, close, low, high from prices
             where asset_id = $1`,
      values: [id],
    })
    return {
      id, ticker: asset.ticker, name: asset.name || asset.ticker,
      prices,
    };
  }
}
