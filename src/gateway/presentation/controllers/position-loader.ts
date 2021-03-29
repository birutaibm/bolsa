import { Authorization } from '@domain/user/usecases';
import { PositionLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, ok, Params, Response,
} from '@gateway/presentation/contracts';
import { positionView } from '@gateway/presentation/view/position';

export class PositionLoaderController extends Controller {
  constructor(
    private readonly positionLoader: PositionLoader,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({id, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!id) {
      return clientError('Required parameters: id');
    }
    const position = await this.positionLoader.load(id, checkLoggedUserId);
    return ok(positionView(position));
  }
}
