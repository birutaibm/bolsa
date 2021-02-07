import { PriceUseCasesFactories, UserCreatorFactory } from '@gateway/data/factories';
import {
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory,
  UserCreatorControllerFactory,
} from '@gateway/presentation/factories';

import { FakeUserRepository } from '@infra/data-source/in-memory';
import { Mongo } from '@infra/data-source/database';
import { env } from '@infra/environment';
import { lastRankingLoaderFactory } from './last-ranking-loader';
import { PriceRepositories } from './price-repositories';
import { MongoUserRepository } from '@infra/data-source/repositories/mongo-user';

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo);
const priceServiceFactories = new PriceUseCasesFactories(repositories);
const userServiceFactories = new UserCreatorFactory(
  mongo ? new MongoUserRepository(mongo) : new FakeUserRepository()
);
const {
  lastPriceLoader,
  externalSymbolSearch,
  externalSymbolRegister,
} = priceServiceFactories.getAll();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(lastPriceLoader),

  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),

  symbolSearch: new ExternalSymbolSearchControllerFactory(
    externalSymbolSearch
  ),

  symbolRegister: new ExternalSymbolRegisterControllerFactory(
    externalSymbolRegister
  ),

  userCreator: new UserCreatorControllerFactory(userServiceFactories),
};
