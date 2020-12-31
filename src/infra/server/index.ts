import express from 'express';
import { ApolloServer } from './apollo-server';
import ExpressRouterSetup from './express-router-setup';

const app = express();
const routerSetup = new ExpressRouterSetup(app);
const apollo = new ApolloServer(app);

export default {
  listen: app.listen,
  routes: routerSetup,
  apollo,
};
