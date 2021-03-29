import { ExternalSymbolSearch, SearchResult } from '@domain/price/usecases';
import {
  Controller, Params, Response, notFoundError, ok, clientError,
} from '@gateway/presentation/contracts';

export class ExternalSymbolSearchController extends Controller {
  constructor(
    private readonly useCase: ExternalSymbolSearch,
  ) {
    super();
  }

  protected async tryHandle({ticker}: Params): Promise<Response<SearchResult>> {
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    const results = await this.useCase.search(ticker);
    if (Object.keys(results).length === 0) {
      return notFoundError(`Ticker ${ticker} was not found in any external repository`);
    }
    return ok(results);
  }
}
