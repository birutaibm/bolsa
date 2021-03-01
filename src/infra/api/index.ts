import { Router, Express, json } from 'express';

import { Factory } from '@utils/factory';
import {
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController,
  UserCreatorController,
  SignInController,
} from '@gateway/presentation/controllers';

import routes from './routes';

type ControllerFactories = {
  price: Factory<LoadLastPriceController>;
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

  setup(
    controllerFactories: ControllerFactories,
  ): void {
    routes.price(this.router, controllerFactories.price);
    routes.getSymbol(this.router, controllerFactories.symbolSearch);
    routes.postSymbol(this.router, controllerFactories.symbolRegister);
    routes.postUser(this.router, controllerFactories.userCreator);
    routes.signIn(this.router, controllerFactories.signIn);
  }
}
