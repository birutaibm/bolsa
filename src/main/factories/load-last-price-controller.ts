import { makeLastPriceLoader } from '@infra/factories';
import { LoadLastPriceControllerFactory } from '@presentation/factories';


export const makeLoadLastPriceController =
  new LoadLastPriceControllerFactory(makeLastPriceLoader).make;
