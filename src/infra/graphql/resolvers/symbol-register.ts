import { Factory } from '@utils/factory';
import { ExternalSymbolRegisterController } from '@gateway/presentation/controllers';

import { adaptResolver } from './adapter';

type Symbol = {
  source: string;
  symbol: string;
}

type Params = {
  ticker: string;
  symbols: Symbol[];
}

export default (controllerFactory: Factory<ExternalSymbolRegisterController>) => ({
  Mutation: {
    symbolRegister(_: any, {ticker, symbols}: Params, {authorization}): Promise<any> {
      const params: {[key: string]: string} = {};
      symbols.forEach(({source, symbol}) => params[source] = symbol);
      params.ticker = ticker;
      params.authorization = authorization;
      return adaptResolver(controllerFactory.make(), params);
    }
  },
});
