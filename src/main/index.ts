import { ServerBuilder } from '@infra/server';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { env } from '@infra/environment';
import { securityFactory } from '@infra/factories';

new ServerBuilder()
  .withRepositories(new RepositoryFactoriesBuilder()
    .withAlphavantage(env.externalPrices.alphavantageKey)
    .withPostgre(env.postgre)
    .asSingletonFactory()
  ).withSecurity(securityFactory(env.jwt))
  .withRestAPI()
  .withGraphQL()
  .build()
.then(server =>
  server.start()
).catch(console.error);
