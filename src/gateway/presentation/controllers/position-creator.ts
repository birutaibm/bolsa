import { Authorization } from '@domain/user/usecases';
import { PositionCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class PositionCreatorController implements Controller {
  constructor(
    private readonly positionCreator: PositionCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({ticker, assetName, walletId, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!ticker || !assetName || !walletId) {
      return clientError('Required parameters: ticker, assetName, walletId');
    }
    try {
      const position = await this.positionCreator.create(
        {name: assetName, ticker}, walletId, loggedUserId
      );
      return created(position);
    } catch (error) {
      return serverError(error);
    }
  }
}
