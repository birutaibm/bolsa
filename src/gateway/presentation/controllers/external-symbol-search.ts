import { ExternalSymbolSearch, SearchResult } from '@domain/price/usecases';
import {
  Controller, Params, Response, notFoundError, ok, clientError, serverError
} from '@gateway/presentation/contracts';

export class ExternalSymbolSearchController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolSearch,
  ) {}

  async handle({route}: Params): Promise<Response<SearchResult>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    try {
      const results = await this.useCase.search(ticker);
      if (Object.keys(results).length === 0) {
        return notFoundError(`Ticker ${ticker} was not found in any external repository`);
      }
      return ok(results);
    } catch (error) {
      return serverError(error);
    }
  }
}
