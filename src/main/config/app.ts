import app, { routerSetup, graphqlSetup } from '@infra/server';
import { controllerFactories } from '@infra/factories'
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';

setupRoutes(routerSetup, controllerFactories);
setupApolloServer(graphqlSetup, controllerFactories);

export default app;
