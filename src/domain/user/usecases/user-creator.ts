import User, { Role } from '@domain/user/entities/user';

import { encoder } from './encoder'
import { UserData } from './dto';

export interface RequiredFunctionalities {
  save(user: UserData): Promise<void>;
}

export default class UserCreator {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async create(
    userName: string, password: string, role: Role = 'USER'
  ): Promise<User> {
    const passHash = await encoder.encode(password);
    const user = new User(userName, passHash, role, encoder.verify);
    await this.worker.save(user);
    return user;
  }
}
