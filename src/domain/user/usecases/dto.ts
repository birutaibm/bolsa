import User from '@domain/user/entities/user';

export type UserData = Omit<User, 'checkPassword'>;
