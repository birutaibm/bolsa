import { SingletonFactory } from '@utils/factory';
import { UserLoader, UserCreator, SignIn } from '@domain/user/usecases';
import { UserRepository } from '@gateway/data/contracts';
import Security from '@gateway/security';

export default class UserUseCasesFactories {
  private userLoader: SingletonFactory<UserLoader>;
  private userCreator: SingletonFactory<UserCreator>;
  private signIn: SingletonFactory<SignIn>;

  constructor(
    private readonly repository: UserRepository,
    private readonly security: Security,
  ) {}

  getAll() {
    return {
      userCreator: this.ofUserCreator(),
      userLoader: this.ofUserLoader(),
      signIn: this.ofSignIn(),
    };
  }

  ofUserCreator(): SingletonFactory<UserCreator> {
    if (!this.userCreator) {
      this.userCreator = new SingletonFactory(
        () => new UserCreator(this.repository, this.security)
      );
    }
    return this.userCreator;
  }

  ofUserLoader(): SingletonFactory<UserLoader> {
    if (!this.userLoader) {
      this.userLoader = new SingletonFactory(
        () => new UserLoader(this.repository, this.security)
      );
    }
    return this.userLoader;
  }

  ofSignIn(): SingletonFactory<SignIn> {
    if (!this.signIn) {
      this.signIn = new SingletonFactory(
        () => new SignIn(this.security, this.ofUserLoader().make())
      );
    }
    return this.signIn;
  }
}
