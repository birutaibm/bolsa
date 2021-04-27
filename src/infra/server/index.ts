import express, { Express } from 'express';
import { Server as HTTPServer } from 'http';

import { Factory } from '@utils/factory';
import { MayBePromise } from '@utils/types';

import { RepositoryFactories } from '@gateway/factories';

import RestAPI from '@infra/api';
import GraphQL from '@infra/graphql';
import { Factories } from '@infra/factories'
import { env } from '@infra/environment';
import { ISecurity } from '@gateway/security';

export class Server {
  private running: HTTPServer;
  private port: number;
  readonly url: string;

  constructor(
    private readonly app: Express,
    private readonly factories: Factories,
  ) {
    this.port = Number(env.port);
    this.url = `http://localhost:${this.port}`;
  }

  start() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.running = this.app.listen(this.port, () => {
          console.log(`Server running at ${this.url}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop() {
    this.factories.repositories.disconnectAll();
    console.log(`Finishing server ${this.url}`);
    this.running.close();
  }
}

export class ServerBuilder {
  readonly app: Express;
  private rest: () => Promise<void>;
  private graphql: () => Promise<void>;
  private repositories: () => Promise<RepositoryFactories>;
  private security: Factory<ISecurity>;
  private factories: Factories;

  constructor() {
    this.app = express();
    this.rest = async () => {};
    this.graphql = async () => {};
  }

  private async getFactories(): Promise<Factories> {
    if (!this.factories) {
      const repositories = await this.repositories();
      this.factories = new Factories(repositories, this.security);
    }
    return this.factories;
  };

  withRepositories(repositories: Factory<MayBePromise<RepositoryFactories>>) {
    this.repositories = async () => await repositories.make();
    return this;
  }

  withSecurity(security: Factory<ISecurity>) {
    this.security = security;
    return this;
  }

  withRestAPI() {
    this.rest = () => this.getFactories()
      .then(factories => factories.ofControllers())
      .then(controllers => new RestAPI(this.app).setup(controllers));
    return this;
  }

  withGraphQL() {
    this.graphql = () => this.getFactories()
      .then(factories => factories.ofControllers())
      .then(controllers => new GraphQL(this.app).setup(controllers));
    return this;
  }

  async build() {
    try {
      await this.rest();
      await this.graphql();
      if (!this.factories) {
        throw new Error("Illegal State");
      }
      return new Server(this.app, this.factories);
    } catch (error) {
      throw error
    }
  }
}
