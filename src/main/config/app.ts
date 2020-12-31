import app from '@infra/server';
//import { Mongo } from '@infra/database'
//import { env } from '@main/config/env';
import { setupRoutes } from '@main/config/express-routes';
import { setupApolloServer } from '@main/config/apollo-server';

//const mongo = new Mongo(env.mongodb);
setupRoutes(app.routes);
console.log('configure routes');
setupApolloServer(app.apollo);
console.log('configure apollo');

export default app;
