import User from '@domain/user/entities/user';

import Encoder from './encoder'
import { PersistedUser, PersistedUserData } from './dto';

export interface RequiredFunctionalities {
  getUserFromUsername(userName: string): Promise<PersistedUserData>;
}

export default class UserLoader {
  constructor(
    private readonly worker: RequiredFunctionalities,
    private readonly encoder: Encoder,
  ) {}

  async load(userName: string): Promise<PersistedUser> {
    const { id, passHash, role } = await this.worker.getUserFromUsername(userName);
    const user = new User(userName, passHash, role, this.encoder.verify);
    return {
      ...user,
      id,
    };
  }
}
