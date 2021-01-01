import { Schema, Document, model } from 'mongoose';

type ExternalSymbols = {
  [library: string]: string;
};

type PriceAtDate = {
  date: number;
  open: number;
  close: number;
  min: number;
  max: number;
}

export interface Asset extends Document {
  ticker: string;
  name?: string;
  prices: PriceAtDate[];
  externals: {
    [key: string]: string
  };
}

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

export default model<Asset>('Asset', AssetSchema);
