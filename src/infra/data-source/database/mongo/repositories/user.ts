import { UserNotFoundError } from '@errors/not-found';
import { Persisted } from '@utils/types';

import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import Users from '@infra/data-source/model/user';
import Mongo from '..';

export class MongoUserRepository implements UserRepository {
  constructor(
    private readonly mongo: Mongo
  ) {}

  async getUserFromUsername(userName: string): Promise<Persisted<UserDTO>> {
    if (!this.mongo.isConnected()) {
      await this.mongo.connect();
    }

    const user = await Users.findOne({ userName });
    if (user) {
      return user;
    }
    throw new UserNotFoundError(userName);
  }

  async saveUser(user: UserDTO): Promise<Persisted<{}>> {
    if (!this.mongo.isConnected()) {
      await this.mongo.connect();
    }

    const created = await Users.create(user);
    return await created.save();
  }
}
