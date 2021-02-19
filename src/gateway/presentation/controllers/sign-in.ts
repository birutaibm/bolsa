import SignIn from '@domain/user/usecases/sign-in';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class SignInController implements Controller {
  constructor(
    private readonly signIn: SignIn,
  ) {}

  async handle({ userName, password }: Params): Promise<Response> {
    if (!userName || !password) {
      return clientError('Required parameters: userName, password');
    }
    try {
      const token = await this.signIn.signIn(userName, password);
      return created({ token });
    } catch (error) {
      if (error.name === 'InvalidUserPasswordError') {
        return unauthorized('Invalid user and/or password');
      }
      return serverError(error);
    }
  }
}
