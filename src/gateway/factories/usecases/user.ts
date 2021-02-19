import { SingletonFactory } from '@utils/factory';
import { UserLoader, UserCreator, SignIn } from '@domain/user/usecases';
import { UserRepository } from '@gateway/data/contracts';
import Security from '@gateway/security';

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

  return {
    userCreator,
    signIn,
    userLoader,
  };
}
