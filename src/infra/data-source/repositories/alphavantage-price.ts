import axios from 'axios';

import { LoadExternalPriceRepository, SearchExternalSymbolRepository } from "@data/contracts";
import { ExternalSymbolsDTO, PriceDTO } from "@data/dto";
import { ExternalPriceLoaderError } from '@infra/errors';

export class LoadAlphavantagePriceRepository implements LoadExternalPriceRepository, SearchExternalSymbolRepository {
  name = 'alphavantage';

  async getExternalSymbols(ticker: string): Promise<ExternalSymbolsDTO> {
    const response = await this.api.get(`&function=SYMBOL_SEARCH&keywords=${ticker}`);
    const data: Array<{[key: string]: string}> = this.extractOrFail(response, 'bestMatches');
    const result: ExternalSymbolsDTO = {};
    data.map(entry => {
      const symbol = entry['1. symbol'];
      delete entry['1. symbol'];
      result[symbol] = entry;
    });
    return result;
  }

  private readonly api = axios.create({
    baseURL: 'https://www.alphavantage.co/query?apikey=TBKVBVUN7P8KMWT0',
  });

  async getExternalSymbol(ticker: string): Promise<string> {
    const response = await this.api.get(`&function=SYMBOL_SEARCH&keywords=${ticker}`);
    return this.extractOrFail(response, 'bestMatches', 0, '1. symbol');
  }

  async loadPriceBySymbol(symbol: string): Promise<Array<Omit<PriceDTO, 'ticker' | 'name'>>> {
    const response = await this.api.get(`&function=TIME_SERIES_DAILY&symbol=${symbol}`);
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
        throw new ExternalPriceLoaderError('alphavantage', `API returns wrong data format: ${data}`);
      }
    }
    return value;
  }
}
