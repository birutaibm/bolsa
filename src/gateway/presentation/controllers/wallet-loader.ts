import { Authorization } from '@domain/user/usecases';
import { WalletLoader } from '@domain/wallet/usecases';
import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, notFoundError, ok, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { walletView } from '../view';

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
      return ok(walletView(wallet));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof WalletNotFoundError) {
        return notFoundError(`Can't found wallet with id ${id}`);
      }
      return serverError(error);
    }
  }
}
