import SignIn from '@domain/user/usecases/sign-in';
import { Factory } from '@utils/factory';
import { SignInController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class SignInControllerFactory
  extends ControllerFactory<SignInController> {

  constructor(
    useCaseFactory: Factory<SignIn>,
  ) {
    super(() => new SignInController(useCaseFactory.make()));
  }
}
