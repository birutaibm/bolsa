import SignIn from '@domain/user/usecases/sign-in';

import {
  clientError, Controller, created, Params, Response,
} from '@gateway/presentation/contracts';

export class SignInController extends Controller {
  constructor(
    private readonly signIn: SignIn,
  ) {
    super();
  }

  protected async tryHandle({ userName, password }: Params): Promise<Response> {
    if (!userName || !password) {
      return clientError('Required parameters: userName, password');
    }
    const token = await this.signIn.signIn(userName, password);
    return created({ token });
  }
}
