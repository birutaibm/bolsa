import { Authorization } from '@domain/user/usecases';
import { InvestorLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class InvestorLoaderController implements Controller {
  constructor(
    private readonly investorLoader: InvestorLoader,
    private readonly auth: Authorization,
  ) {}

  async handle({id, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!id) {
      return clientError('Required parameters: id');
    }
    try {
      const investor = await this.investorLoader.load(id, loggedUserId);
      return created(investor);
    } catch (error) {
      return serverError(error);
    }
  }
}
