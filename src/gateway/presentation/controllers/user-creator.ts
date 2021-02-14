import UserCreator from '@domain/user/usecases/user-creator';

import {
  clientError, Controller, created, Params, Response, serverError
} from '@gateway/presentation/contracts';
import { userTranslator } from '@gateway/presentation/view/user';

export class UserCreatorController implements Controller {
  constructor(
    private readonly userCreator: UserCreator,
  ) {}

  async handle(params: Params): Promise<Response> {
    const { userName, password, role } = params.body || {};
    if (!userName || !password) {
      return clientError('Required parameters: userName, password');
    }
    try {
      const user = (role && role.toUpperCase() === 'ADMIN')
        ? await this.userCreator.create(userName, password, 'ADMIN')
        : await this.userCreator.create(userName, password);
      return created(userTranslator.entityToView(user));
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
