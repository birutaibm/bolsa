import { Authorization } from '@domain/user/usecases';
import { InvestorLoader } from '@domain/wallet/usecases';

import {
  clientError, Controller, ok, Params, Response, unauthorized
} from '@gateway/presentation/contracts';
import { investorView } from '../view/investor';

export class InvestorLoaderController extends Controller {
  constructor(
    private readonly investorLoader: InvestorLoader,
    private readonly auth: Authorization,
  ) {
    super();
  }

  protected async tryHandle({id, authorization}: Params): Promise<Response> {
    if (!id) {
      return clientError('Required parameters: id');
    }
    if (!this.auth.checkId(id, authorization)) {
      return unauthorized('Login required to this action!');
    }
    const investor = await this.investorLoader.load(id);
    return ok(investorView(investor));
  }
}
