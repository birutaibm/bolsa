import { Authorization } from '@domain/user/usecases';
import { PositionLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

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
      return created(position);
    } catch (error) {
      return serverError(error);
    }
  }
}
