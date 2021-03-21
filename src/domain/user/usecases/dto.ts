import User from '@domain/user/entities/user';

export type UserData = Omit<User, 'checkPassword'>;

export type PersistedUserData = UserData & {id: string};

export type PersistedUser = User & {id: string};
