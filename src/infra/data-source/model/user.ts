import { Schema, Document, model } from 'mongoose';

import { UserDTO } from '@gateway/data/dto';

export type User = UserDTO;

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
});

export default model<UserDocument>('User', userSchema);
