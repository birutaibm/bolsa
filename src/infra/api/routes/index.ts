import { Router } from 'express';

import { Factory } from '@utils/factory';
import { Controller } from '@gateway/presentation/contracts';

import price from './price';
import getSymbol from './get-symbol';
import postSymbol from './post-symbol';
import postUser from './post-user';
import signIn from './sign-in';

type setupRouteFn<T extends Controller> = (
  router: Router,
  controllerFactory: Factory<T>
) => void;

type setupRoute = {
  [key: string]: setupRouteFn<any>;
};

const routeSetups: setupRoute = {
  price, getSymbol, postSymbol, postUser, signIn
};

export default routeSetups;
