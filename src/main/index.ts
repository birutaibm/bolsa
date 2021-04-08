import { ServerBuilder } from '@infra/server';
import { Factories } from '@infra/factories';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { env } from '@infra/environment';

new RepositoryFactoriesBuilder()
  .withMongo(env.mongodb)
  .withAlphavantage(env.externalPrices.alphavantageKey)
  .withPostgre(env.postgre)
  .build()
.then(repositories => new Factories(repositories))
.then(factories => new ServerBuilder()
  .withFactories(factories)
  .withRestAPI()
  .withGraphQL()
  .build()
).then(server =>
  server.start()
).catch(console.error);
