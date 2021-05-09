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
  private rest: () => void;
  private graphql: () => void;
  private repositories: () => RepositoryFactories;
  private security: Factory<ISecurity>;
  private factories: Factories;

  constructor() {
    this.app = express();
    this.rest = async () => {};
    this.graphql = async () => {};
  }

  private getFactories(): Factories {
    if (!this.factories) {
      this.factories = new Factories(this.repositories(), this.security);
    }
    return this.factories;
  };

  withRepositories(repositories: Factory<RepositoryFactories>) {
    this.repositories = () => repositories.make();
    return this;
  }

  withSecurity(security: Factory<ISecurity>) {
    this.security = security;
    return this;
  }

  withRestAPI() {
    this.rest = () => new RestAPI(this.app)
      .setup(this.getFactories().ofControllers());
    return this;
  }

  withGraphQL() {
    this.graphql = () => new GraphQL(this.app)
      .setup(this.getFactories().ofControllers())
    return this;
  }

  async build() {
    console.log('Creating Server...');
    try {
      this.rest();
      this.graphql();
      if (!this.factories) {
        throw new Error("Illegal State");
      }
      console.log('Server created');
      return new Server(this.app, this.factories);
    } catch (error) {
      throw error
    }
  }
}
