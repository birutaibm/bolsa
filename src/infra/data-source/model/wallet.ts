import { Schema, Document, model, Types } from 'mongoose';

export type WalletData = {
  id: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  positionIds: Types.ObjectId[];
};

export type WalletDocument = Document & WalletData;

const walletSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  },
  positionIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Position'
  }],
});

export default model<WalletDocument>('Wallet', walletSchema);
