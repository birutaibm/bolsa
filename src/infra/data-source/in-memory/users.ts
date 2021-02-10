import { UserNotFoundError } from '@errors/user-not-found';
import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

export class FakeUserRepository implements UserRepository {
  private readonly users: UserDTO[] = [];

  async saveUser(user: UserDTO): Promise<void> {
    this.users.push(user);
  }
  async getUserFromUsername(userName: string): Promise<UserDTO> {
    const user = this.users.find((user: UserDTO) => user.userName === userName);
    if (user) {
      return user;
    }
    throw new UserNotFoundError(userName);
  }
}
