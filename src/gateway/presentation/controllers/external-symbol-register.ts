import { ExternalSymbolRegister } from '@domain/price/usecases';
import {
  Controller, Params, Response, created, clientError, serverError
} from '@gateway/presentation/contracts';

export class ExternalSymbolRegisterController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolRegister,
  ) {}

  async handle({ ticker, ...rest }: Params): Promise<Response> {
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    const knownSources = this.useCase.getKnownSources();
    const dictionary = knownSources
      .filter(source => rest[source])
      .map(source => ({
        ticker,
        source,
        externalSymbol: rest[source],
      }));
    try {
      const result = await this.useCase.registryAll(dictionary);
      return result.length
        ? created(result)
        : clientError('Can not find any valid symbol');
    } catch (error) {
      return serverError(error);
    }
  }
}
