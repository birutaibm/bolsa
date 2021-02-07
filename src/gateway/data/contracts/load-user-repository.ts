import { UserDTO } from '@gateway/data/dto';

export interface LoadUserRepository {
  getUserFromUsername(userName: string): Promise<UserDTO>;
}
