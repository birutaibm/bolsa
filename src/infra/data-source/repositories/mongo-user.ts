import { CreateUserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import Users from '@infra/data-source/model/user';
import { Mongo } from '@infra/data-source/database';

export class MongoUserRepository implements CreateUserRepository {
  constructor(
    mongo: Mongo,
  ) {
    mongo.connect();
  }

  async saveUser(user: UserDTO): Promise<void> {
    const created = await Users.create(user);
    await created.save();
  }
}
