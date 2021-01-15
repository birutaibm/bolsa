import { ExternalSymbolsDTO, PriceDTO, SymbolDictionaryEntryDTO } from "@data/dto";

export interface ExternalSymbolDictionary {
  getExternalSymbol: (ticker: string, externalLibrary: string) => Promise<string>;
}

export interface LoadExternalPriceRepository extends ExternalSymbolDictionary {
  loadPriceBySymbol: (symbol: string) => Promise<Array<Omit<PriceDTO, 'ticker' | 'name'>>>;
}

export interface SavePriceFromExternalRepository {
  save: (externalName: string, externalSymbol: string, price: PriceDTO[]) => Promise<PriceDTO[]>
}

export interface SearchExternalSymbolRepository {
  readonly name: string;
  getExternalSymbols: (ticker: string) => Promise<ExternalSymbolsDTO>;
}

export interface RegistryExternalSymbolRepository {
  registryExternalSymbol: (entry: SymbolDictionaryEntryDTO) => Promise<SymbolDictionaryEntryDTO>;
}
