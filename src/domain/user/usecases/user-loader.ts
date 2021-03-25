import User from '@domain/user/entities/user';

import Encoder from './encoder'
import { PersistedUser, PersistedUserData } from './dto';

export type LoadPersistedUserDataFromUsername =
  (userName: string) => Promise<PersistedUserData>;

export default class UserLoader {
  constructor(
    private readonly loadData: LoadPersistedUserDataFromUsername,
    private readonly encoder: Encoder,
  ) {}

  async load(userName: string): Promise<PersistedUser> {
    const { id, passHash, role } = await this.loadData(userName);
    const user = new User(userName, passHash, role, this.encoder.verify);
    return Object.assign(user, {id});
  }
}
