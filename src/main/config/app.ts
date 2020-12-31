import app, { routerSetup, graphqlSetup } from '@infra/server';
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';

//import { Mongo } from '@infra/database'
//import { env } from '@main/config/env';

//const mongo = new Mongo(env.mongodb);
setupRoutes(routerSetup);
setupApolloServer(graphqlSetup);

export default app;
