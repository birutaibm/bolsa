import { Router, Express, json } from 'express';

import { Factory } from '@utils/factory';
import { ControllerFactory } from '@gateway/factories';
import {
  LoadLastPriceController,
  LoadLastRankingController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController,
  UserCreatorController,
  SignInController,
} from '@gateway/presentation/controllers';

import price from './routes/price';
import getSymbol from './routes/get-symbol';
import postSymbol from './routes/post-symbol';
import postUser from './routes/post-user';
import ranking from './routes/ranking';
import signIn from './routes/sign-in';

type setupExpressRoute = (
  router: Router,
  controllerFactory: ControllerFactory<any>
) => void;

type ControllerFactories = {
  price: Factory<LoadLastPriceController>;
  ranking: Factory<LoadLastRankingController>;
  symbolSearch: Factory<ExternalSymbolSearchController>;
  symbolRegister: Factory<ExternalSymbolRegisterController>;
  userCreator: Factory<UserCreatorController>;
  signIn: Factory<SignInController>;
};

export default class API {
  private readonly router: Router;

  constructor(app: Express) {
    this.router = Router();
    app.use(json());
    app.use('/api', this.router);
  }

  use(setup: setupExpressRoute, factory: ControllerFactory<any>) {
    setup(this.router, factory);
  }

  setup(
    controllerFactories: ControllerFactories,
  ): void {
    price(this.router, controllerFactories.price);
    ranking(this.router, controllerFactories.ranking);
    getSymbol(this.router, controllerFactories.symbolSearch);
    postSymbol(this.router, controllerFactories.symbolRegister);
    postUser(this.router, controllerFactories.userCreator);
    signIn(this.router, controllerFactories.signIn);
  }
}
