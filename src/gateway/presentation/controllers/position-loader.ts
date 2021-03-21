import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Authorization } from '@domain/user/usecases';
import { PositionLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, notFoundError, ok, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { positionView } from '@gateway/presentation/view/position';

export class PositionLoaderController implements Controller {
  constructor(
    private readonly positionLoader: PositionLoader,
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
      const position = await this.positionLoader.load(id, loggedUserId);
      return ok(positionView(position));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof PositionNotFoundError) {
        return notFoundError(`Can't found position with id ${id}`);
      }
      return serverError(error);
    }
  }
}
