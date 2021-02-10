import UserLoader from '@domain/user/usecases/user-loader';
import SignIn from '@domain/user/usecases/sign-in';
import { Factory, SingletonFactory } from '@utils/factory';
import Security from '@gateway/security';

export class SignInFactory extends SingletonFactory<SignIn> {
  constructor(
    security: Security,
    userLoader: Factory<UserLoader>,
  ) {
    super(() => new SignIn(
      security,
      userLoader.make(),
    ));
  }
}
