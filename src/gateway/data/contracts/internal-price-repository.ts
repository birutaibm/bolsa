import { MayBePromise, Persisted } from '@domain/wallet/usecases/dtos';

import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export interface ExternalSymbolDictionary {
  getExternalSymbol: (ticker: string, externalLibrary: string) => MayBePromise<string>;
}

export interface AssetRepository {
  loadAssetDataById(id: string): MayBePromise<{id: string; ticker: string; name: string;}>;
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
