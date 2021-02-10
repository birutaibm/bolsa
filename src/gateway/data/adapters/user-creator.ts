import { RequiredFunctionalities } from '@domain/user/usecases/user-creator';

import { UserDTO } from '@gateway/data/dto';
import { CreateUserRepository } from '@gateway/data/contracts';

export class UserCreatorFunctionalities implements RequiredFunctionalities {
  constructor(
    private readonly repository: CreateUserRepository,
  ) {}

  save(user: UserDTO): Promise<void> {
    return this.repository.saveUser(user);
  }
}
