import { Schema, Document, model, Types } from 'mongoose';

type PositionModel = {
  id: Types.ObjectId;
  wallet: Types.ObjectId;
  asset: {
    ticker: string;
    name: string;
  };
  operations: Types.ObjectId[];
};

export type PositionDocument = Document & PositionModel;

const positionSchema = new Schema({
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
    require: true,
  },
  asset: {
    name: {
      type: String,
      require: true,
    },
    ticker: {
      type: String,
      require: true,
    }
  },
  operations: [{
    type: Schema.Types.ObjectId,
    ref: 'Operation'
  }]
});

export default model<PositionDocument>('Position', positionSchema);
