import { Factory } from '@utils/factory';

import { UserRepository } from '@gateway/data/contracts';
import Security from '@gateway/security';
import {
  SignInController, UserCreatorController
} from '@gateway/presentation/controllers';
import { ControllerFactory, UserUseCasesFactories } from '@gateway/factories';

type UserControllers = {
  readonly userCreator: Factory<UserCreatorController>;
  readonly signIn: Factory<SignInController>;
};

export function createUserControllers(
  repositoryFactory: Factory<UserRepository>,
  securityFactory: Factory<Security>
): UserControllers {
  const security = securityFactory.make();
  const repository = repositoryFactory.make();
  const useCases = new UserUseCasesFactories(repository, security);
  const {
    userCreator,
    signIn,
  } = useCases.getAll();

  return {
    userCreator: new ControllerFactory(
      () => new UserCreatorController(userCreator.make())
    ),

    signIn: new ControllerFactory(
      () => new SignInController(signIn.make())
    ),
  };
}
