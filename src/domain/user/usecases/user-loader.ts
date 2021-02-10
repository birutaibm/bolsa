import User from '@domain/user/entities/user';

import { encoder } from './encoder'
import { UserData } from './dto';

export interface RequiredFunctionalities {
  getUser(userName: string): Promise<UserData>;
}

export default class UserLoader {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async load(userName: string): Promise<User> {
    const { passHash, role } = await this.worker.getUser(userName);
    return new User(userName, passHash, role, encoder.verify);
  }
}
