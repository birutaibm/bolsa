import UserLoader from '@domain/user/usecases/user-loader';
import { UserData } from '@domain/user/usecases/dto';
import Encoder from '@domain/user/usecases/encoder';
import { UserNotFoundError } from '@errors/not-found';

let validUserName: string;
let getUserFromUsername: (userName: string) => Promise<UserData & {id: string}>;
let useCase: UserLoader;

describe('UserLoader', () => {
  beforeAll(() => {
    validUserName = 'Rafael Arantes';
    const encoder: Encoder = {
      encode: plain => Promise.resolve(plain),
      verify: (plain, encoded) => plain === encoded,
    }
    getUserFromUsername = async userName => {
      if (userName !== validUserName) {
        throw new UserNotFoundError(userName);
      }
      return {
        id: '',
        userName,
        role: 'ADMIN',
        passHash: 'password',
      };
    };
    useCase = new UserLoader(getUserFromUsername, encoder);
  });

  it('should be able load existent user', async done => {
    await expect(
      useCase.load(validUserName)
    ).resolves.toBeInstanceOf(Object);
    done();
  });

  it('should not be able load non existent user', async done => {
    await expect(
      useCase.load('birutaibm')
    ).rejects.toBeInstanceOf(UserNotFoundError);
    done();
  });
});
