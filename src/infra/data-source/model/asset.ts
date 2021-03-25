import { Schema, Document, model } from 'mongoose';

import { PriceDTO } from '@gateway/data/dto';

export const adapter = {
  toPriceDTOs: (asset: Asset) => asset.prices.map(price => ({
    ticker: asset.ticker,
    name: asset.name || asset.ticker,
    open: price.open,
    close: price.close,
    min: price.min,
    max: price.max,
    date: new Date(price.date),
  })),

  priceDTOToPriceField: (prices: PriceDTO[]) => prices.map(price => ({
    open: price.open,
    close: price.close,
    min: price.min,
    max: price.max,
    date: price.date.getTime(),
  })),
}

type PriceAtDate = {
  date: number;
  open: number;
  close: number;
  min: number;
  max: number;
}

export type Asset = {
  id: string;
  ticker: string;
  name?: string;
  prices: PriceAtDate[];
  externals: Map<string, string>;
}

export type AssetDocument = Document & Asset;

const AssetSchema = new Schema({
  ticker: {
    type: String,
    required: true,
  },
  name: String,
  prices: [{
    type: new Schema({
      date: Number,
      open: Number,
      close: Number,
      min: Number,
      max: Number,
    }),
  }],
  externals: {
    type: Map,
    of: String,
    default: {},
  },
});

export default model<AssetDocument>('Asset', AssetSchema);
