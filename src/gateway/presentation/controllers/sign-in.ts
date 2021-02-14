import SignIn from '@domain/user/usecases/sign-in';

import {
  clientError, Controller, created, Params, Response, serverError
} from '@gateway/presentation/contracts';

export class SignInController implements Controller {
  constructor(
    private readonly signIn: SignIn,
  ) {}

  async handle(params: Params): Promise<Response> {
    const { userName, password } = params.body || {};
    if (!userName || !password) {
      return clientError('Required parameters: userName, password');
    }
    try {
      const token = await this.signIn.signIn(userName, password);
      return created({ token });
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
