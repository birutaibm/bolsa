import { MayBePromise, Persisted } from '@utils/types';

import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export type AssetData = {
  id: string;
  ticker: string;
  name: string;
  prices: Array<{
    date: Date;
    open: number;
    close: number;
    low: number;
    high: number;
  }>;
};

export interface ExternalSymbolDictionary {
  getExternalSymbol: (ticker: string, externalLibrary: string) => MayBePromise<string>;
}

export interface AssetRepository {
  loadAssetDataById(id: string): MayBePromise<AssetData>;
}

export interface SavePricesRepository {
  save: (ticker: string, price: PriceDTO[]) => MayBePromise<AssetPriceDTO[]>
}

export interface RegistryExternalSymbolRepository {
  registryExternalSymbol: (entry: SymbolDictionaryEntryDTO) => MayBePromise<Persisted<SymbolDictionaryEntryDTO>>;
}

export interface LoadPriceRepository {
  loadPriceByTicker: (ticker: string) => MayBePromise<AssetPriceDTO[]>
}

export interface InternalPriceRepository extends
  AssetRepository,
  LoadPriceRepository,
  ExternalSymbolDictionary,
  SavePricesRepository,
  RegistryExternalSymbolRepository {
}
