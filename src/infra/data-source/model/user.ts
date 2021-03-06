import { Schema, Document, model } from 'mongoose';

import { UserDTO, OwnerDTO } from '@gateway/data/dto';

export type User = UserDTO & OwnerDTO;

export type UserDocument = Document & User;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  passHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'USER',
  },
  wallets: [{
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  }],
  name: String,
});

export default model<UserDocument>('User', userSchema);
