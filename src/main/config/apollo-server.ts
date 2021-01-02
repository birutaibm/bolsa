import { LoadLastRankingControllerFactory } from '@presentation/factories';
import { ApolloServerSetup } from '@infra/server/apollo-server-setup';
import typeDefs from '@infra/graphql/type-defs';
import rankingResolver from '@infra/graphql/resolvers/ranking';

type ControllerFactories = {
  ranking: LoadLastRankingControllerFactory;
};

export function setupApolloServer(
  apolloServer: ApolloServerSetup,
  controllerFactories: ControllerFactories,
): void {
  const resolvers = [
    rankingResolver(controllerFactories.ranking),
  ];
  apolloServer.setup(resolvers, typeDefs);
}
