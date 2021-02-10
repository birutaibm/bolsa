import { UserRepository } from '@gateway/data/contracts';

import { UserCreatorFactory } from './user-creator';
import { UserLoaderFactory } from './user-loader';
import { SignInFactory } from './sign-in';
import Security from '@gateway/security';

export class UserUseCasesFactories {
  private userCreator: UserCreatorFactory;
  private userLoader: UserLoaderFactory;
  private signIn: SignInFactory;

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

  ofUserCreator(): UserCreatorFactory {
    if (!this.userCreator) {
      this.userCreator = new UserCreatorFactory(this.repository, this.security);
    }
    return this.userCreator;
  }

  ofUserLoader(): UserLoaderFactory {
    if (!this.userLoader) {
      this.userLoader = new UserLoaderFactory(this.repository, this.security);
    }
    return this.userLoader;
  }

  ofSignIn(): SignInFactory {
    if (!this.signIn) {
      this.signIn = new SignInFactory(
        this.security,
        this.ofUserLoader(),
      );
    }
    return this.signIn;
  }
}
