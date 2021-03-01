import { ExternalSymbolRegister } from '@domain/price/usecases';
import { Authorization } from '@domain/user/usecases';
import {
  Controller, Params, Response, created, clientError, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class ExternalSymbolRegisterController implements Controller {
  constructor(
    private readonly useCase: ExternalSymbolRegister,
    private readonly auth: Authorization,
  ) {}

  async handle({ authorization, ticker, ...rest }: Params): Promise<Response> {
    if (!this.auth.checkAdmin(authorization)) {
      return unauthorized('Admin privilegies required to this action!');
    }
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
        : clientError('Your request has no valid symbol.');
    } catch (error) {
      return serverError(error);
    }
  }
}
