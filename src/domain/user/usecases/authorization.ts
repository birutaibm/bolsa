import { Role } from "../entities/user";

type VerifyToken = (token: string) => { role: Role; userName: string; };

export default class Authorization {
  constructor(
    private readonly verifyToken: VerifyToken,
  ) {}

  private extractRole(authorization: string | undefined): Role | undefined {
    try {
      if (authorization?.startsWith('Token ')) {
        const token = authorization.substring(6);
        return this.verifyToken(token).role;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  getUserName(authorization: string | undefined): string | undefined {
    try {
      if (authorization?.startsWith('Token ')) {
        const token = authorization.substring(6);
        return this.verifyToken(token).userName;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  checkUser(authorization?: string): boolean {
    return this.extractRole(authorization) === 'USER';
  }

  checkAdmin(authorization?: string): boolean {
    return this.extractRole(authorization) === 'ADMIN';
  }
}
