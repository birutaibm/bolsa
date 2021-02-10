import { CreateUserRepository } from './create-user-repository';
import { LoadUserRepository } from './load-user-repository';

export interface UserRepository
  extends LoadUserRepository, CreateUserRepository
{}
