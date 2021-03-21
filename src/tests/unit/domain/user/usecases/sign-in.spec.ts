import UserLoader from '@domain/user/usecases/user-loader';
import SignIn from '@domain/user/usecases/sign-in';
import { InvalidUserPasswordError } from '@errors/invalid-user-password';
import Encoder from '@domain/user/usecases/encoder';
import { Role } from '@domain/user/entities/user';
import { UserNotFoundError } from '@errors/user-not-found';

let createToken: (payload: object) => string;
let loader: UserLoader;
let useCase: SignIn;
let password: string;
let user: string;

describe('SignIn', () => {
  beforeAll(async (done) => {
    createToken = user => JSON.stringify(user);
    const encoder: Encoder = {
      encode: plain => Promise.resolve(plain),
      verify: (plain, encoded) => plain === encoded,
    }
    password = 'password';
    user = 'Rafael Arantes'
    const getUserFromUsername = async userName => {
      if (userName === user)
        return {
          id: '0',
          userName,
          role: 'USER' as Role,
          passHash: password,
        };
      throw new UserNotFoundError(userName);
    };
    loader = new UserLoader({getUserFromUsername}, encoder);
    useCase = new SignIn({createToken}, loader);
    done();
  });

  it('should be able to signIn with correct credentials', async done => {
    const payload = await useCase.signIn(user, password);
    const json = JSON.parse(payload);
    expect(json).toEqual(expect.objectContaining({userName: user, role: 'USER'}));
    done();
  });

  it('should not be able to signIn with wrong password', async done => {
    await expect(
      useCase.signIn(user, 'wrong password')
    ).rejects.toBeInstanceOf(InvalidUserPasswordError);
    done();
  });

  it('should not be able to signIn with wrong user', async done => {
    await expect(
      useCase.signIn('wrong user', password)
    ).rejects.toBeInstanceOf(InvalidUserPasswordError);
    done();
  });

  it('should repass any unpredicted error, without change it', async done => {
    const error = new Error("I'm an unpredictable error!");
    const createToken = () => {throw error};
    const useCase = new SignIn({createToken}, loader);
    await expect(
      useCase.signIn(user, password)
    ).rejects.toBe(error);
    done();
  });
});
