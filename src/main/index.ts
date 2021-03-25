import { ServerBuilder } from '@infra/server';

new ServerBuilder().withRestAPI().withGraphQL().build().then(server =>
  server.start()
).catch(console.error);
