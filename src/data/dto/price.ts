import { Price } from '@domain/entities';

export type AssetPriceDTO = Price;

export type PriceDTO = Omit<AssetPriceDTO, 'ticker' | 'name'>;
