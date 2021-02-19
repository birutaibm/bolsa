import { Factory } from '@utils/factory';
import {
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController,
} from '@gateway/presentation/controllers';

import base from './base';
import price from './price';
import symbolSearch from './symbol-search';
import symbolRegister from './symbol-register';


type ControllerFactories = {
  price: Factory<LoadLastPriceController>;
  symbolSearch: Factory<ExternalSymbolSearchController>;
  symbolRegister: Factory<ExternalSymbolRegisterController>;
};

export default (controllerFactories: ControllerFactories) => [
  base,
  price(controllerFactories.price),
  symbolSearch(controllerFactories.symbolSearch),
  symbolRegister(controllerFactories.symbolRegister),
];
