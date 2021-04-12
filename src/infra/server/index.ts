import express, { Express } from 'express';
import { Server as HTTPServer } from 'http';

import { Factory } from '@utils/factory';
import { MayBePromise } from '@utils/types';

import { RepositoryFactories } from '@gateway/factories';

import RestAPI from '@infra/api';
import GraphQL from '@infra/graphql';
import { Factories } from '@infra/factories'
import { env } from '@infra/environment';

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
  private factories: () => Promise<Factories>;

  constructor() {
    this.app = express();
    this.rest = async () => {};
    this.graphql = async () => {};
  }

  withRepositories(factories: Factory<MayBePromise<RepositoryFactories>>) {
    const build = async () => await factories.make();
    this.factories = () => build()
      .then(repositories => new Factories(repositories));
    return this;
  }

  withRestAPI() {
    this.rest = () => this.factories()
      .then(factories => factories.ofControllers())
      .then(controllers => new RestAPI(this.app).setup(controllers));
    return this;
  }

  withGraphQL() {
    this.graphql = () => this.factories()
      .then(factories => factories.ofControllers())
      .then(controllers => new GraphQL(this.app).setup(controllers));
    return this;
  }

  async build() {
    return this.rest()
      .then(this.graphql)
      .then(this.factories)
      .then(factories => new Server(this.app, factories));
  }
}
