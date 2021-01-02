import app, { routerSetup, graphqlSetup } from '@infra/server';
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';
import { controllerFactories } from '@infra/factories'

setupRoutes(routerSetup, controllerFactories);
setupApolloServer(graphqlSetup, controllerFactories);

export default app;
