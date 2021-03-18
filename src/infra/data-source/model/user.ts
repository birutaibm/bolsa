import { Schema, Document, model } from 'mongoose';

import { Persisted } from '@domain/wallet/usecases/dtos';

import { UserDTO } from '@gateway/data/dto';

export type UserDocument = Document & Persisted<UserDTO>;

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
});

export default model<UserDocument>('User', userSchema);
