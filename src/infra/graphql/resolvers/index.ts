import { Factory } from '@utils/factory';
import {
  LoadLastRankingController,
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController,
} from '@gateway/presentation/controllers';

import base from './base';
import ranking from './ranking';
import price from './price';
import symbolSearch from './symbol-search';
import symbolRegister from './symbol-register';


type ControllerFactories = {
  ranking: Factory<LoadLastRankingController>;
  price: Factory<LoadLastPriceController>;
  symbolSearch: Factory<ExternalSymbolSearchController>;
  symbolRegister: Factory<ExternalSymbolRegisterController>;
};

export default (controllerFactories: ControllerFactories) => [
  base,
  ranking(controllerFactories.ranking),
  price(controllerFactories.price),
  symbolSearch(controllerFactories.symbolSearch),
  symbolRegister(controllerFactories.symbolRegister),
];
