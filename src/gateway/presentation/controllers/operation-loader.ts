import { Authorization } from '@domain/user/usecases';
import { OperationLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, ok, Params, Response,
} from '@gateway/presentation/contracts';

import { operationView } from '../view/operation';

export class OperationLoaderController extends Controller {
  constructor(
    private readonly operationLoader: OperationLoader,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({id, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!id) {
      return clientError('Required parameters: id');
    }
    const operation = await this.operationLoader.load(id, checkLoggedUserId);
    return ok(operationView(operation));
  }
}
