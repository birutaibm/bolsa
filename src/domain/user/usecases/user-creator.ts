import User, { Role } from '@domain/user/entities/user';

import { PersistedUser } from './dto';
import { Encoder, SaveUserData } from './dependencies';

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
