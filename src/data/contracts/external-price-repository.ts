import { ExternalSymbolsDTO, PriceDTO } from '@data/dto';

export interface LoadExternalPriceRepository {
  readonly name: string;
  loadPriceBySymbol: (symbol: string) => Promise<PriceDTO[]>
}

export interface SearchExternalSymbolRepository {
  readonly name: string;
  getExternalSymbols: (ticker: string) => Promise<ExternalSymbolsDTO>;
}

export interface ExternalRepository extends LoadExternalPriceRepository, SearchExternalSymbolRepository {}
