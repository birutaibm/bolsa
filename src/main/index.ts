import { ServerBuilder } from '@infra/server';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { env } from '@infra/environment';

new ServerBuilder()
  .withRepositories(new RepositoryFactoriesBuilder()
    .withMongo(env.mongodb)
    .withAlphavantage(env.externalPrices.alphavantageKey)
    .withPostgre(env.postgre)
    .asSingletonFactory()
  ).withRestAPI()
  .withGraphQL()
  .build()
.then(server =>
  server.start()
).catch(console.error);
