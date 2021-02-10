import UserCreator from '@domain/user/usecases/user-creator';
import Encoder from '@domain/user/usecases/encoder';
import { SingletonFactory } from '@utils/factory';

import { CreateUserRepository } from '@gateway/data/contracts';
import {
  UserCreatorFunctionalities as Functionalities
} from '@gateway/data/adapters';

export class UserCreatorFactory extends SingletonFactory<UserCreator> {
  constructor(
    repository: CreateUserRepository,
    encoder: Encoder,
  ) {
    super(() => new UserCreator(new Functionalities(repository), encoder));
  }
}
