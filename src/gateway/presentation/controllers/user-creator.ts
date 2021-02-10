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
    if (!params.body) {
      return clientError('Required parameters: userName, password, role');
    }
    const { userName, password, role } = params.body;
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
