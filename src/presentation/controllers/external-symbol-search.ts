import { ExternalSymbolSearch, SearchResult } from "@domain/usecases";
import { Controller, ok, Response, serverError } from "@presentation/contracts";

type InputDTO = {
  ticker: string;
}

export class ExternalSymbolSearchController implements Controller<InputDTO> {
  constructor(
    private readonly useCase: ExternalSymbolSearch,
  ) {}

  async handle({ticker}: InputDTO): Promise<Response<SearchResult>> {
    try {
      const result = await this.useCase.search(ticker);
      return ok(result);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
