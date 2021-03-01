import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import { promise } from '@utils/promise';

export type SearchResult = {
  [source: string]: SymbolInfo;
}

type SymbolInfo = {
  [symbol: string]: StringMap;
}

type StringMap = {
  [key: string]: string;
}

export interface RequiredFunctionalities {
  checkThereIsSomeExternal(): boolean;
  getExternalSymbols(ticker: string): Promise<SearchResult>[];
}

export class ExternalSymbolSearch {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async search(ticker: string): Promise<SearchResult> {
    if (!this.worker.checkThereIsSomeExternal()) {
      throw new NoneExternalSymbolRepository();
    }
    const promises = this.worker.getExternalSymbols(ticker);
    const { resolved } = await promise.all(promises);
    if (resolved.length) {
      return resolved.reduce((result, item) => ({...result, ...item}), {});
    }
    return {};
  }
}
