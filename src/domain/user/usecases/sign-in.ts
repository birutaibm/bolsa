import { InvalidUserPasswordError } from '@errors/invalid-user-password';
import { UserNotFoundError } from '@errors/not-found';

import UserLoader from './user-loader';
import { PersistedUser } from './dto';

export type CreateToken = (payload: object) => string;

export default class SignIn {
  constructor(
    private readonly createToken: CreateToken,
    private readonly loader: UserLoader,
  ) {}

  async signIn(userName: string, password: string): Promise<string> {
    const user = await this.loadUser(userName);
    if (!user.checkPassword(password)) {
      throw new InvalidUserPasswordError();
    }
    return this.createToken({
      id: user.id,
      userName,
      role: user.role,
    });
  }

  private async loadUser(userName: string): Promise<PersistedUser> {
    try {
      return await this.loader.load(userName);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new InvalidUserPasswordError();
      } else {
        throw error;
      }
    }
  }
}
