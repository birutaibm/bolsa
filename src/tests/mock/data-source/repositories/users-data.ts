import { UserDTO } from '@gateway/data/dto';

const passHash = '123456';

export const user: Omit<UserDTO, 'passHash'> = {
  id: '0', userName: 'testUser', role: 'USER',
};
export const admin: Omit<UserDTO, 'passHash'> = {
  id: '1', userName: 'testAdmin', role: 'ADMIN',
};

export const users: UserDTO[] = [
  { ...user, passHash, },
  { ...admin, passHash, }
];
