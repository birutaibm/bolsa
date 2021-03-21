import { Router, Express, json } from 'express';

import { Factory } from '@utils/factory';

import {
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController,
  UserCreatorController,
  SignInController,
  InvestorCreatorController,
  InvestorLoaderController,
  OperationCreatorController,
  OperationLoaderController,
  PositionCreatorController,
  PositionLoaderController,
  WalletCreatorController,
  WalletLoaderController,
} from '@gateway/presentation/controllers';

import routes from './routes';

type ControllerFactories = {
  price: Factory<LoadLastPriceController>;
  symbolSearch: Factory<ExternalSymbolSearchController>;
  symbolRegister: Factory<ExternalSymbolRegisterController>;
  userCreator: Factory<UserCreatorController>;
  signIn: Factory<SignInController>;
  investorLoader: Factory<InvestorLoaderController>;
  investorCreator: Factory<InvestorCreatorController>;
  walletLoader: Factory<WalletLoaderController>;
  walletCreator: Factory<WalletCreatorController>;
  positionLoader: Factory<PositionLoaderController>;
  positionCreator: Factory<PositionCreatorController>;
  operationLoader: Factory<OperationLoaderController>;
  operationCreator: Factory<OperationCreatorController>;
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
    routes.getInvestor(this.router, controllerFactories.investorLoader);
    routes.getWallet(this.router, controllerFactories.walletLoader);
    routes.getPosition(this.router, controllerFactories.positionLoader);
    routes.getOperation(this.router, controllerFactories.operationLoader);
    routes.postInvestor(this.router, controllerFactories.investorCreator);
    routes.postWallet(this.router, controllerFactories.walletCreator);
    routes.postPosition(this.router, controllerFactories.positionCreator);
    routes.postOperation(this.router, controllerFactories.operationCreator);
  }
}
