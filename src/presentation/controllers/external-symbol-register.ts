import { ExternalSymbolRegister } from '@domain/usecases';
import {
  Controller, Params, Response, created, clientError, serverError
} from '@presentation/contracts';

export class ExternalSymbolRegisterController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolRegister,
  ) {}

  async handle({ route, body }: Params): Promise<Response> {
    const ticker = route?.ticker;
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    if (!body) {
      return clientError('Can not find any symbol at body');
    }
    const knownSources = this.useCase.getKnownSources();
    const dictionary = knownSources
      .filter(source => body[source])
      .map(source => ({
        ticker,
        source,
        externalSymbol: body[source],
      }));
    try {
      const result = await this.useCase.registryAll(dictionary);
      return result.length
        ? created(result)
        : clientError('Can not find any valid symbol at body');
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
