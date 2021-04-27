import { Persisted } from '@utils/types';
import { UserNotFoundError } from '@errors/not-found';

import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import { users } from './users-data';

export class FakeUserRepository implements UserRepository {
  saveUser(user: UserDTO): Persisted<any> {
    user.id = user.id || String(users.length);
    users.push(user);
    return user;
  }

  getUserFromUsername(userName: string): Persisted<UserDTO> {
    const index = users.findIndex((user: UserDTO) =>
      user.userName === userName
    );
    if (index !== -1) {
      return {...users[index], id: String(index)};
    }
    throw new UserNotFoundError(userName);
  }
}
