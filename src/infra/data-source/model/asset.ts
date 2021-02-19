import { Schema, Document, model } from 'mongoose';

import { AssetPriceDTO } from '@gateway/data/dto';

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

  fromPriceDTO(price: AssetPriceDTO): Asset {
    return {
      ticker: price.ticker,
      name: price.name,
      externals: new Map(),
      prices: [{
        open: price.open,
        close: price.close,
        min: price.min,
        max: price.max,
        date: price.date.getTime(),
      }],
    };
  },

  fromPriceDTOs(prices: AssetPriceDTO[]): Asset[] {
    const assets: {[key: string]: Asset} = {};
    prices.forEach(price => {
      const assetPrice = {
        open: price.open,
        close: price.close,
        min: price.min,
        max: price.max,
        date: price.date.getTime(),
      };
      if (!assets[price.ticker]) {
        assets[price.ticker] = {
          ticker: price.ticker,
          name: price.name,
          externals: new Map(),
          prices: [assetPrice],
        };
      } else {
        assets[price.ticker].prices.push(assetPrice);
        if (assets[price.ticker].name === price.ticker) {
          assets[price.ticker].name = price.name;
        }
      }
    })
    return Object.values(assets);
  }
}

type PriceAtDate = {
  date: number;
  open: number;
  close: number;
  min: number;
  max: number;
}

export type Asset = {
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
