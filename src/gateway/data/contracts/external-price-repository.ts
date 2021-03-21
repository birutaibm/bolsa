import { MayBePromise } from '@domain/wallet/usecases/dtos';
import { ExternalSymbolsDTO, PriceDTO } from '@gateway/data/dto';

export interface LoadExternalPriceRepository {
  readonly name: string;
  loadPriceBySymbol(symbol: string): MayBePromise<PriceDTO[]>;
}

export interface SearchExternalSymbolRepository {
  readonly name: string;
  getExternalSymbols(ticker: string): MayBePromise<ExternalSymbolsDTO>;
}

export interface ExternalRepository extends LoadExternalPriceRepository, SearchExternalSymbolRepository {}
