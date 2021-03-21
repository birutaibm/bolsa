import { InvalidUserPasswordError } from '@errors/invalid-user-password';
import { UserNotFoundError } from '@errors/user-not-found';
import User from '../entities/user';

import UserLoader from './user-loader';

export interface RequiredFunctionalities {
  createToken(payload: object): string;
}

export default class SignIn {
  constructor(
    private readonly worker: RequiredFunctionalities,
    private readonly loader: UserLoader,
  ) {}

  async signIn(userName: string, password: string): Promise<string> {
    let user: User & { id: string; };
    try {
      user = await this.loader.load(userName);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new InvalidUserPasswordError();
      } else {
        throw error;
      }
    }
    if (user.checkPassword(password)) {
      return this.worker.createToken({
        id: user.id,
        userName,
        role: user.role,
      });
    } else {
      throw new InvalidUserPasswordError();
    }
  }
}
