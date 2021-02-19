import { InvalidUserPasswordError } from '@errors/invalid-user-password';

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
    try {
      const user = await this.loader.load(userName);
      if (user.checkPassword(password)) {
        return this.worker.createToken({userName, role: user.role});
      }
    } catch (error) {
      if (error.name !== 'UserNotFoundError') {
        throw error
      }
    }
    throw new InvalidUserPasswordError();
  }
}