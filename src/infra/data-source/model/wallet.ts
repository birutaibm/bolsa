import { Schema, Document, model, Types } from 'mongoose';

export type WalletData = {
  id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  positions: Types.ObjectId[];
};

export type WalletDocument = Document & WalletData;

const walletSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  },
  positions: [{
    type: Schema.Types.ObjectId,
    ref: 'Position'
  }],
});

export default model<WalletDocument>('Wallet', walletSchema);
