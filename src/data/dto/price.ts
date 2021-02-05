export type AssetPriceDTO = PriceDTO & {
  ticker: string;
  name: string;
};

export type PriceDTO = {
  date: Date;
  open: number;
  close: number;
  min: number;
  max: number;
};
