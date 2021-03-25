import User, { Role } from '@domain/user/entities/user';

import { PersistedUser, UserData } from './dto';
import Encoder from './encoder';

export type SaveUserData = (user: UserData) => Promise<{id: string}>;

export default class UserCreator {
  constructor(
    private readonly save: SaveUserData,
    private readonly encoder: Encoder,
  ) {}

  async create(
    userName: string, password: string, role: Role = 'USER'
  ): Promise<PersistedUser> {
    const passHash = await this.encoder.encode(password);
    const user = new User(userName, passHash, role, this.encoder.verify);
    const { id } = await this.save({userName, passHash, role});
    return Object.assign(user, { id });
  }
}
