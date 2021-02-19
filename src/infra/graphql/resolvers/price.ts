import { Factory } from '@utils/factory';
import { LoadLastPriceController } from '@gateway/presentation/controllers';

import { adaptResolver } from './adapter';

export default (controllerFactory: Factory<LoadLastPriceController>) => ({
  Query: {
    async lastPrice(_: any, args: { ticker: string; }): Promise<any> {
      return adaptResolver(controllerFactory.make(), args);
    }
  }
});
