import { CreateUserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

export class FakeUserRepository implements CreateUserRepository {
  private readonly users: UserDTO[] = []

  async saveUser(user: UserDTO): Promise<void> {
    this.users.push(user);
  }
}
