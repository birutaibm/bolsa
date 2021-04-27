import { InvalidUserPasswordError } from '@errors/invalid-input';
import { UserNotFoundError } from '@errors/not-found';

import UserLoader from './user-loader';
import { PersistedUser } from './dto';
import { TokenCreator } from './dependencies';

export default class SignIn {
  constructor(
    private readonly tokenCreator: TokenCreator,
    private readonly loader: UserLoader,
  ) {}

  async signIn(userName: string, password: string): Promise<string> {
    const user = await this.loadUser(userName);
    if (!user.checkPassword(password)) {
      throw new InvalidUserPasswordError();
    }
    return this.tokenCreator.createToken({
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
