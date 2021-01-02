import { Schema, Document, model } from 'mongoose';

type PriceAtDate = {
  date: number;
  open: number;
  close: number;
  min: number;
  max: number;
}

export interface Asset {
  ticker: string;
  name?: string;
  prices: PriceAtDate[];
  externals: {
    [key: string]: string
  };
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
  },
});

export default model<AssetDocument>('Asset', AssetSchema);
