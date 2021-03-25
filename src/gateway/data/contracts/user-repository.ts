import { Persisted } from '@domain/wallet/usecases/dtos';
import { UserDTO } from '@gateway/data/dto';

export interface LoadUserRepository {
  getUserFromUsername(userName: string): Promise<Persisted<UserDTO>>;
}

export interface CreateUserRepository {
  saveUser(user: UserDTO): Promise<Persisted<{}>>;
}

export interface UserRepository
  extends LoadUserRepository, CreateUserRepository
{}
