import { promise } from "@data/utils";
import { SymbolDictionaryEntry } from "@domain/entities";
import { ExternalSymbolRegister } from "@domain/usecases";
import { Controller, created, Params, Response, serverError } from "@presentation/contracts";

export class ExternalSymbolRegisterController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolRegister,
  ) {}

  async handle({ route, body }: Params): Promise<Response<SymbolDictionaryEntry[]>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return serverError(new Error('Can not find ticker at route'));
    }
    if (!body) {
      return serverError(new Error('Can not find any symbol at body'));
    }
    const knownSources = ['alphavantage']; // TODO create an external provider for this constant
    const dictionary: SymbolDictionaryEntry[] = knownSources
      .filter(source => body[source])
      .map(source => ({
        ticker,
        source,
        externalSymbol: body[source],
      }));
    const promises = dictionary.map(entry =>
      promise.noRejection(() => this.useCase.registry(entry))
    );
    try {
      const result = await Promise.all(promises);
      const success = result.filter(entry => Object.keys(entry).length !== 0);
      return created(success);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
