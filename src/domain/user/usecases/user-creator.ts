import User, { Role } from '@domain/user/entities/user';

import { encoder } from './encoder'

export type UserData = Omit<User, 'checkPassword'>;

export interface RequiredFunctionalities {
  save(user: UserData): Promise<void>;
}

export default class UserCreator {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async fromPlainPassword(
    userName: string, password: string, role: Role = 'USER'
  ): Promise<User> {
    const passHash = await encoder.encode(password);
    const user = new User(userName, passHash, role, encoder.verify);
    await this.worker.save(user)
    return user;
  }

  async fromHashedPassword(
    userName: string, passHash: string, role: Role = 'USER'
  ): Promise<User> {
    return new User(userName, passHash, role, encoder.verify);
  }
}
