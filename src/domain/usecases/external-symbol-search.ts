import { NoneExternalSymbolRepository } from '@domain/errors';

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
    const resolved = await Promise.all(promises);
    return resolved.reduce((result, item) => ({...result, ...item}), {});
  }
}
