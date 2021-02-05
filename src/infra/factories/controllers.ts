import { Mongo } from '@infra/data-source/database';
import { env } from '@infra/environment';
import { lastRankingLoaderFactory } from './last-ranking-loader';
import { PriceRepositories } from './price-repositories';
import { PriceUseCasesFactories } from '@gateway/data/factories';
import {
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory,
} from '@gateway/presentation/factories';

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo);
const services = new PriceUseCasesFactories(repositories);
const {
  lastPriceLoader,
  externalSymbolSearch,
  externalSymbolRegister,
} = services.getAll();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(lastPriceLoader),

  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),

  symbolSearch: new ExternalSymbolSearchControllerFactory(
    externalSymbolSearch
  ),

  symbolRegister: new ExternalSymbolRegisterControllerFactory(
    externalSymbolRegister
  ),
};
