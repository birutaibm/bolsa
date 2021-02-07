import SignIn from '@domain/user/usecases/sign-in';

import {
  clientError, Controller, created, Params, Response, serverError
} from '@gateway/presentation/contracts';

export class SignInController implements Controller {
  constructor(
    private readonly signIn: SignIn,
  ) {}

  async handle(params: Params): Promise<Response> {
    if (!params.body) {
      return clientError('Required parameters: userName, password');
    }
    const { userName, password } = params.body;
    try {
      const token = await this.signIn.signIn(userName, password);
      return created({ token });
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
