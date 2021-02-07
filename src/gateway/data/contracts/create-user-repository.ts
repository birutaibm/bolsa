import { UserDTO } from '@gateway/data/dto';

export interface CreateUserRepository {
  saveUser(user: UserDTO): Promise<void>;
}
