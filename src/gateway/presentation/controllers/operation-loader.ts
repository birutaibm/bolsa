import { Authorization } from '@domain/user/usecases';
import { OperationLoader } from '@domain/wallet/usecases';
import { OperationNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, notFoundError, ok, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { operationView } from '../view/operation';

export class OperationLoaderController implements Controller {
  constructor(
    private readonly operationLoader: OperationLoader,
    private readonly auth: Authorization,
  ) {}

  async handle({id, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!id) {
      return clientError('Required parameters: id');
    }
    try {
      const operation = await this.operationLoader.load(id, checkLoggedUserId);
      return ok(operationView(operation));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof OperationNotFoundError) {
        return notFoundError(`Can't found operation with id ${id}`);
      }
      return serverError(error);
    }
  }
}
