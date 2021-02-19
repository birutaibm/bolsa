import express, { Express } from 'express';

import RestAPI from '@infra/api';
import GraphQL from '@infra/graphql';
import { controllerFactories } from '@infra/factories'

const app: Express = express();

const api = new RestAPI(app);
const graphql = new GraphQL(app);

api.setup(controllerFactories);
graphql.setup(controllerFactories);

export default app;
