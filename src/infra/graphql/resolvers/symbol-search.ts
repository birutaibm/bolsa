import { Factory } from '@utils/factory';
import { ExternalSymbolSearchController } from '@gateway/presentation/controllers';

import { adaptResolver } from './adapter';

type Params = {
  ticker: string;
  [key: string]: string;
};

export default (controllerFactory: Factory<ExternalSymbolSearchController>) => ({
  Query: {
    async symbolSearch(_: any, args: Params): Promise<any> {
      return adaptResolver(controllerFactory.make(), args);
    }
  },
});
