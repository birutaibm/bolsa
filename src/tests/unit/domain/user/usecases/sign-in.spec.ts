import UserLoader from '@domain/user/usecases/user-loader';
import SignIn from '@domain/user/usecases/sign-in';
import { InvalidUserPasswordError } from '@errors/invalid-user-password';
import Encoder from '@domain/user/usecases/encoder';
import { Role } from '@domain/user/entities/user';

let createToken: (payload: object) => string;
let loader: UserLoader;
let useCase: SignIn;
let password: string;

describe('SignIn', () => {
  beforeAll(async (done) => {
    createToken = user => JSON.stringify(user);
    const encoder: Encoder = {
      encode: plain => Promise.resolve(plain),
      verify: (plain, encoded) => plain === encoded,
    }
    password = 'password';
    const getUser = async userName => ({
      userName,
      role: 'USER' as Role,
      passHash: password,
    });
    loader = new UserLoader({getUser}, encoder);
    useCase = new SignIn({createToken}, loader);
    done();
  });

  it('should be able to signIn with correct credentials', async done => {
    const payload = await useCase.signIn('Rafael Arantes', 'password');
    const json = JSON.parse(payload);
    expect(json).toEqual({userName: 'Rafael Arantes', role: 'USER'});
    done();
  });

  it('should not be able to signIn with correct credentials', async done => {
    await expect(
      useCase.signIn('Rafael Arantes', 'wrong password')
    ).rejects.toBeInstanceOf(InvalidUserPasswordError)
    done();
  });
});
