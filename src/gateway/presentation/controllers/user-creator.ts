import UserCreator from '@domain/user/usecases/user-creator';

import {
  clientError, Controller, created, Params, Response,
} from '@gateway/presentation/contracts';
import { userTranslator } from '@gateway/presentation/view/user';

export class UserCreatorController extends Controller {
  constructor(
    private readonly userCreator: UserCreator,
  ) {
    super();
  }

  protected async tryHandle({ userName, password, role }: Params): Promise<Response> {
    if (!userName || !password) {
      return clientError('Required parameters: userName, password');
    }
    const user = (role && role.toUpperCase() === 'ADMIN')
      ? await this.userCreator.create(userName, password, 'ADMIN')
      : await this.userCreator.create(userName, password);
    return created(userTranslator.entityToView(user));
  }
}
