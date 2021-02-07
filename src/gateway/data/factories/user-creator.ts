import UserCreator, { RequiredFunctionalities } from "@domain/user/usecases/user-creator";
import { SingletonFactory } from "@utils/factory";

import { UserDTO } from '@gateway/data/dto';
import { CreateUserRepository } from '@gateway/data/contracts';

class Functionalities implements RequiredFunctionalities {
  constructor(
    private readonly repository: CreateUserRepository,
  ) {}

  save(user: UserDTO): Promise<void> {
    return this.repository.saveUser(user);
  }
}

export class UserCreatorFactory extends SingletonFactory<UserCreator> {
  constructor(
    repository: CreateUserRepository,
  ) {
    super(() => new UserCreator(new Functionalities(repository)));
  }
}
