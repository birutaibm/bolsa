import { Persisted } from '@utils/types';
import { UserNotFoundError } from '@errors/not-found';

import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

export class FakeUserRepository implements UserRepository {
  private readonly users: UserDTO[] = [{
    id: '0',
    userName: 'testUser',
    role: 'USER',
    passHash: '123456',
  }, {
    id: '1',
    userName: 'testAdmin',
    role: 'ADMIN',
    passHash: '123456',
  }];

  async saveUser(user: UserDTO): Promise<Persisted<any>> {
    user.id = user.id || String(this.users.length);
    this.users.push(user);
    return user;
  }

  async getUserFromUsername(userName: string): Promise<Persisted<UserDTO>> {
    const index = this.users.findIndex((user: UserDTO) =>
      user.userName === userName
    );
    if (index !== -1) {
      return {...this.users[index], id: String(index)};
    }
    throw new UserNotFoundError(userName);
  }
}
