import {
  createControllerFactories, createUseCasesFactories, RepositoryFactories
} from '@gateway/factories';

import { env } from '@infra/environment';
import { RepositoryFactoriesBuilder } from '@infra/data-source';

import securityFactory from './security';

class Factories {
  private readonly security = securityFactory;
  private repositories: RepositoryFactories;
  private useCases: ReturnType<typeof createUseCasesFactories>;
  private controllers: ReturnType<typeof createControllerFactories>;

  async ofRepositories() {
    if (!this.repositories) {
      this.repositories = await new RepositoryFactoriesBuilder()
        .withMongo(env.mongodb)
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withPostgre(env.postgre)
        .build();
    }
    return this.repositories;
  }

  async ofSecurity() {
    return this.security;
  }

  async ofUseCases() {
    if (!this.useCases) {
      const repositories = await this.ofRepositories();
      this.useCases = createUseCasesFactories(
        repositories,
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

export default new Factories();
