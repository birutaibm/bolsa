import { Price } from '@domain/entities';

export interface LastPriceLoader {
  load: (ticker: string) => Promise<Price>;
}
