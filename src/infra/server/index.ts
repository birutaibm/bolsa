import express from 'express';

import API from '@infra/api';
import ApolloServerSetup from '@infra/graphql';
import { controllerFactories } from '@infra/factories'

const app = express();

const api = new API(app);
const graphql = new ApolloServerSetup(app);

api.setup(controllerFactories);
graphql.setup(controllerFactories);

export default app;
