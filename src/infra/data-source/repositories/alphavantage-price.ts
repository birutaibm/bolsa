import axios from 'axios';

import { ExternalRepository } from '@gateway/data/contracts';
import { ExternalSymbolsDTO, AssetPriceDTO } from '@gateway/data/dto';

import { ExternalPriceLoaderError } from '@errors/external-price-loader';

type Prices = Promise<Array<Omit<AssetPriceDTO, 'ticker' | 'name'>>>;

export class AlphavantagePriceRepository implements ExternalRepository {
  public readonly name = 'alphavantage';
  private readonly api = axios.create({
    baseURL: 'https://www.alphavantage.co/query?apikey=TBKVBVUN7P8KMWT0',
  });

  async getExternalSymbols(ticker: string): Promise<ExternalSymbolsDTO> {
    const response = await this.api.get(
      `&function=SYMBOL_SEARCH&keywords=${ticker}`
    );
    const data: Array<{[key: string]: string}> =
      this.extractOrFail(response, 'bestMatches');
    const result: ExternalSymbolsDTO = {};
    data.map(entry => {
      const symbol = entry['1. symbol'];
      if (!symbol) {
        throw new ExternalPriceLoaderError(
          'alphavantage',
          `API returns wrong bestMatches format: ${data}`,
        );
      }
      delete entry['1. symbol'];
      result[symbol] = entry;
    });
    return result;
  }

  async loadPriceBySymbol(symbol: string): Prices {
    const response = await this.api.get(
      `&function=TIME_SERIES_DAILY&symbol=${symbol}`
    );
    const data = this.extractOrFail(response, 'Time Series (Daily)');
    return Object.keys(data).map(key => {
      const [ year, month, day ] = key.split('-').map(Number);
      return {
        date: new Date(year, month-1, day),
        open: Number(data[key]['1. open']),
        close: Number(data[key]['4. close']),
        min: Number(data[key]['3. low']),
        max: Number(data[key]['2. high']),
      };
    });
  }

  private extractOrFail(source: any, ...path: Array<string | number>) {
    if (!source) {
      throw new ExternalPriceLoaderError('alphavantage', 'api return nothing');
    }
    const {data} = source;
    if (!data) {
      throw new ExternalPriceLoaderError('alphavantage', 'api returns no data');
    }
    if (data['Error Message']) {
      throw new ExternalPriceLoaderError('alphavantage', data['Error Message']);
    }
    if (data['Note']) {
      throw new ExternalPriceLoaderError('alphavantage', data['Note']);
    }
    let value = data;
    for (const key of path) {
      value = value[key];
      if (!value) {
        throw new ExternalPriceLoaderError(
          'alphavantage',
          `API returns wrong data format: ${data}`,
        );
      }
    }
    return value;
  }
}
