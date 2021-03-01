import { SingletonFactory } from '@utils/factory';
import { Authorization, UserLoader, UserCreator, SignIn } from '@domain/user/usecases';
import { UserRepository } from '@gateway/data/contracts';
import Security from '@gateway/security';
import { createVerifyToken } from '@gateway/data/adapters';

export default function createUserUseCasesFactories(
  repository: UserRepository,
  security: Security,
) {
  const userLoader = new SingletonFactory(
    () => new UserLoader(repository, security)
  );
  const userCreator = new SingletonFactory(
    () => new UserCreator(repository, security)
  );
  const signIn = new SingletonFactory(
    () => new SignIn(security, userLoader.make())
  );
  const authorization = new SingletonFactory(
    () => new Authorization(createVerifyToken(security))
  );

  return {
    userCreator,
    signIn,
    userLoader,
    authorization,
  };
}
