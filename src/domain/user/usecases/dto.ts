import User, { Role } from '@domain/user/entities/user';

export type UserData = {
  readonly userName: string;
  readonly role: Role;
  readonly passHash: string;
};

export type PersistedUserData = {
  readonly userName: string;
  readonly role: Role;
  readonly passHash: string;
  readonly id: string;
};

export type PersistedUser = User & {id: string};
