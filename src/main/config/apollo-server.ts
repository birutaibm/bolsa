import typeDefs from '@main/graphql/type-defs';
import { ApolloServerSetup } from '@infra/server/apollo-server-setup';
import { LoadLastRankingControllerFactory } from '@presentation/factories';
import rankingResolver from '@main/graphql/resolvers/ranking';

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
