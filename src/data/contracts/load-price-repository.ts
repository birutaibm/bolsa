import { PriceDTO } from '@data/dto';

export interface LoadPriceRepository {
  loadPriceByTicker: (ticker: string) => Promise<PriceDTO[] | undefined>
}
