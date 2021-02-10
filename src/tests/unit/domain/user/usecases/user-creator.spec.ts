import UserCreator from '@domain/user/usecases/user-creator';
import { UserData } from '@domain/user/usecases/dto';
import Encoder from '@domain/user/usecases/encoder';

let save: (user: UserData) => Promise<void>;
let useCase: UserCreator;

describe('UserCreator', () => {
  beforeAll(() => {
    const encoder: Encoder = {
      encode: plain => Promise.resolve(plain),
      verify: (plain, encoded) => plain === encoded,
    }
    save = async user => {};
    useCase = new UserCreator({save}, encoder);
  });

  it('should be able create user from data', async done => {
    const user = await useCase.create('Rafael Arantes', 'password', 'ADMIN');
    expect(user.userName).toEqual('Rafael Arantes');
    expect(user.checkPassword('password')).toBeTruthy();
    expect(user.role).toEqual('ADMIN');
    done();
  });

  it('should be able create user with default role as "USER"', async done => {
    const user = await useCase.create('Rafael Arantes', 'password');
    expect(user.userName).toEqual('Rafael Arantes');
    expect(user.checkPassword('password')).toBeTruthy();
    expect(user.role).toEqual('USER');
    done();
  });
});
