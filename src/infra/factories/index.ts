import {
  createControllerFactories, createUseCasesFactories, RepositoryFactories
} from '@gateway/factories';

import { env } from '@infra/environment';
import { RepositoryFactoriesBuilder } from '@infra/data-source';

import securityFactory from './security';

export class Factories {
  private readonly security = securityFactory;
  private useCases: ReturnType<typeof createUseCasesFactories>;
  private controllers: ReturnType<typeof createControllerFactories>;

  constructor(
    readonly repositories: RepositoryFactories,
  ) {}

  async ofSecurity() {
    return this.security;
  }

  async ofUseCases() {
    if (!this.useCases) {
      this.useCases = createUseCasesFactories(
        this.repositories,
        await this.ofSecurity(),
      );
    }
    return this.useCases;
  }

  async ofControllers() {
    if (!this.controllers) {
      this.controllers = createControllerFactories(await this.ofUseCases());
    }
    return this.controllers;
  }
}
