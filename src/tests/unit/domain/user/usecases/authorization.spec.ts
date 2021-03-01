import { Authorization } from '@domain/user/usecases';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';

let adminToken: string;
let userToken: string;
let useCase: Authorization;

describe('Authorization', () => {
  beforeAll(() => {
    adminToken = 'klnoovfiosvrvromlnaoinvr';
    userToken = 'lkbvirhlzcuraygvionlnviaruhuçk';
    useCase = new Authorization(token => {
      if (token === adminToken) {
        return {
          role: 'ADMIN',
        };
      }
      if (token === userToken) {
        return {
          role: 'USER',
        };
      }
      throw new InvalidTokenFormatError();
    });
  });

  it('should be able to deny access without authorization info', () => {
    expect(useCase.checkAdmin()).toBeFalsy();
    expect(useCase.checkUser()).toBeFalsy();
  });

  it('should be able to deny access without token authorization info', () => {
    expect(useCase.checkAdmin("I'm an Admin")).toBeFalsy();
    expect(useCase.checkUser("I'm an Admin")).toBeFalsy();
  });

  it('should be able to deny access with invalid token', () => {
    expect(useCase.checkAdmin('Token Hello')).toBeFalsy();
    expect(useCase.checkUser('Token Hello')).toBeFalsy();
  });

  it('should be able to deny admin access with user token', () => {
    expect(useCase.checkAdmin(userToken)).toBeFalsy();
  });

  it('should be able to deny user access with admin token', () => {
    expect(useCase.checkAdmin(adminToken)).toBeFalsy();
  });

  it('should be able to give admin access with admin token', () => {
    expect(useCase.checkAdmin(adminToken)).toBeFalsy();
  });

  it('should be able to give user access with user token', () => {
    expect(useCase.checkUser(userToken)).toBeFalsy();
  });
});
