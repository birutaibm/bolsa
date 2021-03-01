import { createVerifyToken } from '@gateway/data/adapters';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';

let verifyToken: (token: string) => object;
let adminToken: string;
let userToken: string;
let verifyUserToken: (token: string) => { role: 'USER' | 'ADMIN' };

describe('Returned function of createVerifyToken', () => {
  beforeAll(() => {
    adminToken = 'admin';
    userToken = 'user';
    verifyToken = (token) => {
      switch (token) {
        case adminToken:
          return { role: 'ADMIN' };
        case userToken:
          return { role: 'USER' };
        default:
          return {};
      }
    };
    verifyUserToken = createVerifyToken({ verifyToken });
  });

  it('should be able to recognize admin token', () => {
    expect(verifyUserToken(adminToken)).toEqual({ role: 'ADMIN' });
  });

  it('should be able to recognize user token', () => {
    expect(verifyUserToken(userToken)).toEqual({ role: 'USER' });
  });

  it('should be able to recognize invalid token', () => {
    expect(
      () => verifyUserToken('invalid')
    ).toThrowError(InvalidTokenFormatError);
  });
});
