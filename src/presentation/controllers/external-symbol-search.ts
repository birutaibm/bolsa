import { ExternalSymbolSearch, SearchResult } from "@domain/usecases";
import { Controller, ok, Params, Response, serverError } from "@presentation/contracts";

export class ExternalSymbolSearchController implements Controller {
  constructor(
    // TODO change to array
    private readonly useCase: ExternalSymbolSearch,
  ) {}

  async handle({route}: Params): Promise<Response<SearchResult>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return serverError(new Error('Can not find ticker at route'));
    }
    try {
      const result = await this.useCase.search(ticker);
      return ok(result);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
