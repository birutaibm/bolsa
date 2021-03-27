import { Authorization } from '@domain/user/usecases';
import { WalletCreator } from '@domain/wallet/usecases';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { walletView } from '../view';

export class WalletCreatorController implements Controller {
  constructor(
    private readonly walletCreator: WalletCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({name, investorId, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!name || !investorId) {
      return clientError('Required parameters: investorId, name');
    }
    try {
      const wallet = await this.walletCreator.create(
        {walletName: name, investorId, isLogged: checkLoggedUserId},
      );
      return created(walletView(wallet));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      return serverError(error);
    }
  }
}
