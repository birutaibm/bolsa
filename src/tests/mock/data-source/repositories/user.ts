import { UserNotFoundError } from '@errors/user-not-found';
import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

export class FakeUserRepository implements UserRepository {
  private readonly users: UserDTO[] = [];

  async saveUser(user: UserDTO): Promise<void> {
    this.users.push(user);
  }

  async getUserFromUsername(userName: string): Promise<UserDTO & {id: any}> {
    const index = this.users.findIndex((user: UserDTO) =>
      user.userName === userName
    );
    if (index !== -1) {
      return {...this.users[index], id: index};
    }
    throw new UserNotFoundError(userName);
  }
}
