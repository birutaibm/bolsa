import UserCreator from '@domain/user/usecases/user-creator';
import { UserData } from '@domain/user/usecases/dto';

let save: (user: UserData) => Promise<void>;
let useCase: UserCreator;

describe('UserCreator', () => {
  beforeAll(() => {
    save = async user => {};
    useCase = new UserCreator({save});
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
