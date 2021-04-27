import { SingletonFactory } from '@utils/factory';
import { Authorization, UserLoader, UserCreator, SignIn } from '@domain/user/usecases';
import { UserRepository } from '@gateway/data/contracts';
import { ISecurity } from '@gateway/security';

export default function createUserUseCasesFactories(
  repository: UserRepository,
  security: ISecurity,
) {
  const userLoader = new SingletonFactory(() => new UserLoader(
    username => repository.getUserFromUsername(username),
    security,
  ));
  const userCreator = new SingletonFactory(() => new UserCreator(
    userData => repository.saveUser(userData),
    security,
  ));
  const signIn = new SingletonFactory(() => new SignIn(
    security,
    userLoader.make(),
  ));
  const authorization = new SingletonFactory(
    () => new Authorization(security)
  );

  return {
    userCreator,
    signIn,
    userLoader,
    authorization,
  };
}
