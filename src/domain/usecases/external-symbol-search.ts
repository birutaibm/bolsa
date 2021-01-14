export type SearchResult = {
  [source: string]: SymbolInfo;
}

type SymbolInfo = {
  [symbol: string]: StringMap;
}

type StringMap = {
  [key: string]: string;
}

export interface ExternalSymbolSearch {
  search: (ticker: string) => Promise<SearchResult>
}
