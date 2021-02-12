import User, { Role } from '@domain/user/entities/user';

import { UserData } from './dto';
import Encoder from './encoder';

export interface RequiredFunctionalities {
  saveUser(user: UserData): Promise<void>;
}

export default class UserCreator {
  constructor(
    private readonly worker: RequiredFunctionalities,
    private readonly encoder: Encoder,
  ) {}

  async create(
    userName: string, password: string, role: Role = 'USER'
  ): Promise<User> {
    const passHash = await this.encoder.encode(password);
    const user = new User(userName, passHash, role, this.encoder.verify);
    await this.worker.saveUser(user);
    return user;
  }
}
