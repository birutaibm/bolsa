import { Authorization } from '@domain/user/usecases';
import { OperationLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class OperationLoaderController implements Controller {
  constructor(
    private readonly operationLoader: OperationLoader,
    private readonly auth: Authorization,
  ) {}

  async handle({id, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!id) {
      return clientError('Required parameters: id');
    }
    try {
      const operation = await this.operationLoader.load(id, loggedUserId);
      return created(operation);
    } catch (error) {
      return serverError(error);
    }
  }
}
