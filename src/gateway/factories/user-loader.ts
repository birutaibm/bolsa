import UserLoader from '@domain/user/usecases/user-loader';
import Encoder from '@domain/user/usecases/encoder';
import { SingletonFactory } from '@utils/factory';

import { LoadUserRepository } from '@gateway/data/contracts';
import {
  UserLoaderFunctionalities as Functionalities
} from '@gateway/data/adapters';

export class UserLoaderFactory extends SingletonFactory<UserLoader> {
  constructor(
    repository: LoadUserRepository,
    encoder: Encoder,
  ) {
    super(() => new UserLoader(new Functionalities(repository), encoder));
  }
}
