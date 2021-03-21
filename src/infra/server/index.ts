import express, { Express } from 'express';
import { Server as HTTPServer } from 'http';

import RestAPI from '@infra/api';
import GraphQL from '@infra/graphql';
import factories from '@infra/factories'
import { env } from '@infra/environment';

export class Server {
  private running: HTTPServer;
  private port: number;
  readonly url: string;

  constructor(
    private readonly app: Express,
  ) {
    this.port = Number(env.port);
    this.url = `http://localhost:${this.port}`;
  }

  start() {
    this.running = this.app.listen(
      this.port,
      () => console.log(`Server running at ${this.url}`)
    );
  }

  async stop() {
    (await factories.ofRepositories()).disconnectAll();
    console.log(`Finishing server ${this.url}`);
    this.running.close();
  }
}

export class ServerBuilder {
  readonly app: Express;
  private rest: () => Promise<void>;
  private graphql: () => Promise<void>;

  constructor() {
    this.app = express();
    this.rest = async () => {};
    this.graphql = async () => {};
  }

  private getControllerFactories() {
    return factories.ofControllers();
  }

  withRestAPI() {
    this.rest = async () =>
      new RestAPI(this.app).setup(await this.getControllerFactories());
    return this;
  }

  withGraphQL() {
    this.graphql = async () =>
      new GraphQL(this.app).setup(await this.getControllerFactories());
    return this;
  }

  async build() {
    await this.rest();
    await this.graphql();
    return new Server(this.app);
  }
}
