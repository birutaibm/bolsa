import { AssetPriceDTO } from '@data/dto';
import { Asset } from '@infra/data-source/model/asset';

export const assetAdapter = {
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
      externals: {},
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
          externals: {},
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
