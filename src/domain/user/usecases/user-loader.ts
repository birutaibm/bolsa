import User from '@domain/user/entities/user';

import Encoder from './encoder'
import { UserData } from './dto';

export interface RequiredFunctionalities {
  getUser(userName: string): Promise<UserData>;
}

export default class UserLoader {
  constructor(
    private readonly worker: RequiredFunctionalities,
    private readonly encoder: Encoder,
  ) {}

  async load(userName: string): Promise<User> {
    const { passHash, role } = await this.worker.getUser(userName);
    return new User(userName, passHash, role, this.encoder.verify);
  }
}
