import { Authorization } from '@domain/user/usecases';
import { InvestorLoader } from '@domain/wallet/usecases';
import { InvestorNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, notFoundError, ok, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { investorView } from '../view/investor';

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
      return ok(investorView(investor));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof InvestorNotFoundError) {
        return notFoundError(`Can't found investor with id ${id}`);
      }
      return serverError(error);
    }
  }
}
