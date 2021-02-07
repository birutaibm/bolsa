import { Router, Express, json } from 'express';

import {
  ControllerFactory,
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory,
  UserCreatorControllerFactory,
} from '@gateway/presentation/factories';

import price from './routes/price';
import getSymbol from './routes/get-symbol';
import postSymbol from './routes/post-symbol';
import postUser from './routes/post-user';
import ranking from './routes/ranking';

type setupExpressRoute = (
  router: Router,
  controllerFactory: ControllerFactory<any>
) => void;

type ControllerFactories = {
  price: LoadLastPriceControllerFactory;
  ranking: LoadLastRankingControllerFactory;
  symbolSearch: ExternalSymbolSearchControllerFactory;
  symbolRegister: ExternalSymbolRegisterControllerFactory;
  userCreator: UserCreatorControllerFactory;
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
  }
}
