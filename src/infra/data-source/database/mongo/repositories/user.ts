import { UserNotFoundError } from '@errors/not-found';

import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import Users from '@infra/data-source/model/user';
import { Persisted } from '@domain/wallet/usecases/dtos';

export class MongoUserRepository implements UserRepository {
  async getUserFromUsername(userName: string): Promise<Persisted<UserDTO>> {
    const user = await Users.findOne({ userName });
    if (user) {
      return user;
    }
    throw new UserNotFoundError(userName);
  }

  async saveUser(user: UserDTO): Promise<Persisted<{}>> {
    const created = await Users.create(user);
    return await created.save();
  }
}
