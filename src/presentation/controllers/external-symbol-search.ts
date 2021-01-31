import { ExternalSymbolSearch, SearchResult } from "@domain/usecases";
import { promise } from "@domain/utils";
import { Controller, notFoundError, ok, Params, Response, serverError } from "@presentation/contracts";

export class ExternalSymbolSearchController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolSearch[],
  ) {}

  async handle({route}: Params): Promise<Response<SearchResult>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return serverError(new Error('Can not find ticker at route'));
    }
    try {
      const promises = this.useCase.map(uc => promise.noRejection(() => uc.search(ticker)));
      const resolved = await Promise.all(promises);
      const results = resolved.reduce((reduced, result) => ({...reduced, ...result}), {});
      if (Object.keys(results).length === 0) {
        return notFoundError(`Ticker ${ticker} was not found in any external repository`);
      }
      return ok(results);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
