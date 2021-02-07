import UserLoader from '@domain/user/usecases/user-loader';
import SignIn from '@domain/user/usecases/sign-in';
import { Factory, SingletonFactory } from '@utils/factory';

export class SignInFactory extends SingletonFactory<SignIn> {
  constructor(
    private readonly createToken: (payload: object) => string,
    userLoader: Factory<UserLoader>,
  ) {
    super(() => new SignIn(
      { createToken },
      userLoader.make(),
    ));
  }
}
