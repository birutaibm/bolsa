import { Authorization } from '@domain/user/usecases';
import { WalletCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class WalletCreatorController implements Controller {
  constructor(
    private readonly walletCreator: WalletCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({name, investorId, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!name || !investorId) {
      return clientError('Required parameters: investorId, name');
    }
    try {
      const wallet = await this.walletCreator.create({name, investorId}, loggedUserId);
      return created(wallet);
    } catch (error) {
      return serverError(error);
    }
  }
}
