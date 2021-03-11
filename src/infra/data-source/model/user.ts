import { Schema, Document, model } from 'mongoose';

import { UserDTO } from '@gateway/data/dto';
import { InvestorDTO } from '@gateway/data/contracts';

export type User = UserDTO & InvestorDTO;

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
  walletIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  }],
  name: String,
});

export default model<UserDocument>('User', userSchema);
