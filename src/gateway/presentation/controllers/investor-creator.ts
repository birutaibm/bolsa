import { Authorization } from '@domain/user/usecases';
import { InvestorCreator } from '@domain/wallet/usecases';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class InvestorCreatorController implements Controller {
  constructor(
    private readonly investorCreator: InvestorCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({id, name, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!id || !name) {
      return clientError('Required parameters: id, name');
    }
    try {
      const investor = await this.investorCreator.create({id, name}, loggedUserId);
      return created(investor);
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      return serverError(error);
    }
  }
}
