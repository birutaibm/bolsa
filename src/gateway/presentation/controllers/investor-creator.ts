import { Authorization } from '@domain/user/usecases';
import { InvestorCreator } from '@domain/wallet/usecases';
import { SignInRequiredError } from '@errors/sign-in-required';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { investorView } from '../view/investor';

export class InvestorCreatorController implements Controller {
  constructor(
    private readonly investorCreator: InvestorCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({id, name, authorization}: Params): Promise<Response> {
    if (!id || !name) {
      return clientError('Required parameters: id, name');
    }
    if (!this.auth.checkId(id, authorization)) {
      return unauthorized('Login required to this action!');
    }
    try {
      const investor = await this.investorCreator.create({id, name});
      return created(investorView(investor));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      return serverError(error);
    }
  }
}
