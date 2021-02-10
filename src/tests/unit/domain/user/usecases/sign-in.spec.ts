import UserCreator from '@domain/user/usecases/user-creator';
import UserLoader from '@domain/user/usecases/user-loader';
import SignIn from '@domain/user/usecases/sign-in';
import { InvalidUserPasswordError } from '@errors/invalid-user-password';

let createToken: (payload: object) => string;
let loader: UserLoader;
let useCase: SignIn;
let password: string;

describe('SignIn', () => {
  beforeAll(async (done) => {
    createToken = user => JSON.stringify(user);
    const save = async user => {};
    const name = 'Rafael Arantes';
    password = 'password';
    const user = await new UserCreator({save}).create(name, password);
    const getUser = async userName => ({
      userName,
      role: user.role,
      passHash: user.passHash,
    });
    loader = new UserLoader({getUser});
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
