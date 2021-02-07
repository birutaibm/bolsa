import UserLoader, { RequiredFunctionalities } from '@domain/user/usecases/user-loader';
import { SingletonFactory } from '@utils/factory';

import { UserDTO } from '@gateway/data/dto';
import { LoadUserRepository } from '@gateway/data/contracts';

class Functionalities implements RequiredFunctionalities {
  constructor(
    private readonly repository: LoadUserRepository,
  ) {}

  getUser(userName: string): Promise<UserDTO> {
    return this.repository.getUserFromUsername(userName);
  }
}

export class UserLoaderFactory extends SingletonFactory<UserLoader> {
  constructor(
    repository: LoadUserRepository,
  ) {
    super(() => new UserLoader(new Functionalities(repository)));
  }
}
