import { Schema, Document, model, Types } from 'mongoose';
import { AssetData } from '@gateway/data/contracts/position-repository';

type PositionModel = {
  id: Types.ObjectId;
  walletId: Types.ObjectId;
  asset: AssetData;
  operationIds: Types.ObjectId[];
};

export type PositionDocument = Document & PositionModel;

const positionSchema = new Schema({
  walletId: {
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
  operationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Operation'
  }]
});

export default model<PositionDocument>('Position', positionSchema);
