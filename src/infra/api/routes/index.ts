import { Router } from 'express';

import { Factory } from '@utils/factory';
import { Controller } from '@gateway/presentation/contracts';

import price from './price';
import getSymbol from './get-symbol';
import postSymbol from './post-symbol';
import postUser from './post-user';
import signIn from './sign-in';
import getInvestor from './get-investor';
import postInvestor from './post-investor';
import getWallet from './get-wallet';
import postWallet from './post-wallet';
import getPosition from './get-position';
import postPosition from './post-position';
import getOperation from './get-operation';
import postOperation from './post-operation';

type setupRouteFn<T extends Controller> = (
  router: Router,
  controllerFactory: Factory<T>
) => void;

type setupRoute = {
  [key: string]: setupRouteFn<any>;
};

const routeSetups: setupRoute = {
  price, getSymbol, postSymbol, postUser, signIn, postInvestor, getInvestor,
  getWallet, postWallet, getPosition, postPosition, getOperation, postOperation,
};

export default routeSetups;
