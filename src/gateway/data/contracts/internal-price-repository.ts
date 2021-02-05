import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export interface ExternalSymbolDictionary {
  getExternalSymbol: (ticker: string, externalLibrary: string) => Promise<string>;
}

export interface SavePricesRepository {
  save: (ticker: string, price: PriceDTO[]) => Promise<AssetPriceDTO[]>
}

export interface RegistryExternalSymbolRepository {
  registryExternalSymbol: (entry: SymbolDictionaryEntryDTO) => Promise<SymbolDictionaryEntryDTO>;
}

export interface LoadPriceRepository {
  loadPriceByTicker: (ticker: string) => Promise<AssetPriceDTO[]>
}

export interface InternalRepository extends
  LoadPriceRepository,
  ExternalSymbolDictionary,
  SavePricesRepository,
  RegistryExternalSymbolRepository {
}
