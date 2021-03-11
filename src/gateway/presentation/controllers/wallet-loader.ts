import { Authorization } from '@domain/user/usecases';
import { WalletLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class WalletLoaderController implements Controller {
  constructor(
    private readonly walletLoader: WalletLoader,
    private readonly auth: Authorization,
  ) {}

  async handle({authorization, id}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!id) {
      return clientError('Required parameters: id');
    }
    try {
      const wallet = await this.walletLoader.load(id, loggedUserId);
      return created(wallet);
    } catch (error) {
      return serverError(error);
    }
  }
}
