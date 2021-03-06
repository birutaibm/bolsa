import { UserDTO } from '@gateway/data/dto';

export interface LoadUserRepository {
  getUserFromUsername(userName: string): Promise<UserDTO & {id: string}>;
}

export interface CreateUserRepository {
  saveUser(user: UserDTO): Promise<void>;
}

export interface UserRepository
  extends LoadUserRepository, CreateUserRepository
{}
