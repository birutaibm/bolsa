import { Factory } from '@utils/factory';
import { SignIn, UserCreator } from '@domain/user/usecases';

import {
  SignInController, UserCreatorController
} from '@gateway/presentation/controllers';
import { ControllerFactory } from '@gateway/factories';

type UserControllers = {
  readonly userCreator: Factory<UserCreatorController>;
  readonly signIn: Factory<SignInController>;
};

type UserUseCasesFactories = {
  userCreator: Factory<UserCreator>;
  signIn: Factory<SignIn>;
}

export function createUserControllers(
  { userCreator, signIn }: UserUseCasesFactories,
): UserControllers {

  return {
    userCreator: new ControllerFactory(
      () => new UserCreatorController(userCreator.make())
    ),

    signIn: new ControllerFactory(
      () => new SignInController(signIn.make())
    ),
  };
}
