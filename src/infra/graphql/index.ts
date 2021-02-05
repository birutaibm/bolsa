import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';

import { LoadLastRankingControllerFactory } from '@gateway/presentation/factories';

import typeDefs from '@infra/graphql/type-defs';
import rankingResolver from '@infra/graphql/resolvers/ranking';

type ControllerFactories = {
  ranking: LoadLastRankingControllerFactory;
};

export default class Graphql {
  constructor(
    private readonly app: Express
  ) {}

  setup(
    controllerFactories: ControllerFactories,
  ): void {
    const resolvers = [
      rankingResolver(controllerFactories.ranking),
    ];
    const server = new ApolloServer({
      resolvers,
      typeDefs,
    });
    server.applyMiddleware({app: this.app});
  }
}
