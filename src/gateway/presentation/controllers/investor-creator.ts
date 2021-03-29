import { Authorization } from '@domain/user/usecases';
import { InvestorCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, unauthorized
} from '@gateway/presentation/contracts';
import { investorView } from '../view/investor';

export class InvestorCreatorController extends Controller {
  constructor(
    private readonly investorCreator: InvestorCreator,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({id, name, authorization}: Params): Promise<Response> {
    if (!id || !name) {
      return clientError('Required parameters: id, name');
    }
    if (!this.auth.checkId(id, authorization)) {
      return unauthorized('Login required to this action!');
    }
    const investor = await this.investorCreator.create({id, name});
    return created(investorView(investor));
  }
}
