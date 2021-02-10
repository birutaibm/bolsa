import { RequiredFunctionalities } from '@domain/user/usecases/user-loader';

import { UserDTO } from '@gateway/data/dto';
import { LoadUserRepository } from '@gateway/data/contracts';

export class UserLoaderFunctionalities implements RequiredFunctionalities {
  constructor(
    private readonly repository: LoadUserRepository,
  ) {}

  getUser(userName: string): Promise<UserDTO> {
    return this.repository.getUserFromUsername(userName);
  }
}
