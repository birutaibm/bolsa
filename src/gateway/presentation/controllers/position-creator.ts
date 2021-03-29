import { Authorization } from '@domain/user/usecases';
import { PositionCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response,
} from '@gateway/presentation/contracts';
import { positionView } from '@gateway/presentation/view/position';

export class PositionCreatorController extends Controller {
  constructor(
    private readonly positionCreator: PositionCreator,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({assetId, walletId, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!assetId || !walletId) {
      return clientError('Required parameters: assetId, walletId');
    }
    const position = await this.positionCreator.create({
      assetId, walletId, isLogged: checkLoggedUserId,
    });
    return created(positionView(position));
  }
}
