import { Persisted, MayBePromise } from '@utils/types';

import { UserDTO } from '@gateway/data/dto';

export interface LoadUserRepository {
  getUserFromUsername(userName: string): MayBePromise<Persisted<UserDTO>>;
}

export interface CreateUserRepository {
  saveUser(user: UserDTO): MayBePromise<Persisted<{}>>;
}

export interface UserRepository
  extends LoadUserRepository, CreateUserRepository
{}
