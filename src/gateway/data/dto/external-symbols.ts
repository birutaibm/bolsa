export type ExternalSymbolsDTO = {
  [symbol: string]: StringMap;
}

type StringMap = {
  [key: string]: string;
}

export type SymbolDictionaryEntryDTO = {
  source: string;
  ticker: string;
  externalSymbol: string;
};
