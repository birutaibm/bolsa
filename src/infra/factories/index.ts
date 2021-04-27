import {
  createControllerFactories, createUseCasesFactories, RepositoryFactories
} from '@gateway/factories';
import { ISecurity } from '@gateway/security';
import { Factory } from '@utils/factory';

export { securityFactory } from './security';

export class Factories {
  private useCases: ReturnType<typeof createUseCasesFactories>;
  private controllers: ReturnType<typeof createControllerFactories>;

  constructor(
    readonly repositories: RepositoryFactories,
    private readonly security: Factory<ISecurity>,
  ) {}

  ofSecurity(): Factory<ISecurity> {
    return this.security;
  }

  ofUseCases() {
    if (!this.useCases) {
      this.useCases = createUseCasesFactories(
        this.repositories,
        this.ofSecurity(),
      );
    }
    return this.useCases;
  }

  ofControllers() {
    if (!this.controllers) {
      this.controllers = createControllerFactories(this.ofUseCases());
    }
    return this.controllers;
  }
}
