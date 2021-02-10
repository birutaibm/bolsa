import UserLoader from '@domain/user/usecases/user-loader';
import { UserData } from '@domain/user/usecases/dto';
import User from '@domain/user/entities/user';
import Encoder from '@domain/user/usecases/encoder';

let getUser: (userName: string) => Promise<UserData>;
let useCase: UserLoader;

describe('UserLoader', () => {
  beforeAll(() => {
    const encoder: Encoder = {
      encode: plain => Promise.resolve(plain),
      verify: (plain, encoded) => plain === encoded,
    }
    getUser = async userName => ({
      userName,
      role: 'ADMIN',
      passHash: 'password',
    });
    useCase = new UserLoader({getUser}, encoder);
  });

  it('should be able create user from data', async done => {
    await expect(
      useCase.load('Rafael Arantes')
    ).resolves.toBeInstanceOf(User)
    done();
  });
});
