import express from 'express';

import ExpressRouterSetup from '@infra/server/express-router-setup';
import { ApolloServerSetup } from '@infra/server/apollo-server-setup';

const app = express();

export const routerSetup = new ExpressRouterSetup(app);
export const graphqlSetup = new ApolloServerSetup(app);

export default app;
