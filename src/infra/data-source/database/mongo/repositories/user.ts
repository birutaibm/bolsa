import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';
import { UserNotFoundError } from '@errors/user-not-found';

import Users from '@infra/data-source/model/user';

export class MongoUserRepository implements UserRepository {
  async getUserFromUsername(userName: string): Promise<UserDTO> {
    const user = await Users.findOne({ userName });
    if (user) {
      return user;
    }
    throw new UserNotFoundError(userName);
  }

  async saveUser(user: UserDTO): Promise<void> {
    const created = await Users.create(user);
    await created.save();
  }
}
