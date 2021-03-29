import { Authorization } from '@domain/user/usecases';
import { WalletLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, ok, Params, Response,
} from '@gateway/presentation/contracts';

import { walletView } from '../view';

export class WalletLoaderController extends Controller {
  constructor(
    private readonly walletLoader: WalletLoader,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({authorization, id}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!id) {
      return clientError('Required parameters: id');
    }
    const wallet = await this.walletLoader.load(id, checkLoggedUserId);
    return ok(walletView(wallet));
  }
}
