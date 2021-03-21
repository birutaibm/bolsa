import { Authorization } from '@domain/user/usecases';
import { PositionCreator } from '@domain/wallet/usecases';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { positionView } from '../view/position';

export class PositionCreatorController implements Controller {
  constructor(
    private readonly positionCreator: PositionCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({assetId, walletId, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!assetId || !walletId) {
      return clientError('Required parameters: assetId, walletId');
    }
    try {
      const position = await this.positionCreator.create(
        assetId, walletId, loggedUserId
      );
      return created(positionView(position));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      return serverError(error);
    }
  }
}
