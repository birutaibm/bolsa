import { UserData } from '@domain/user/usecases/dto';

export type UserDTO = UserData & {
  id?: any;
};
