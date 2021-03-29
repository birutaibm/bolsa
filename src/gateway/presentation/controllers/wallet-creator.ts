import { Authorization } from '@domain/user/usecases';
import { WalletCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response,
} from '@gateway/presentation/contracts';

import { walletView } from '../view';

export class WalletCreatorController extends Controller {
  constructor(
    private readonly walletCreator: WalletCreator,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({name, investorId, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!name || !investorId) {
      return clientError('Required parameters: investorId, name');
    }
    const wallet = await this.walletCreator.create(
      {walletName: name, investorId, isLogged: checkLoggedUserId},
    );
    return created(walletView(wallet));
  }
}
