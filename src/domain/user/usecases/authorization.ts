import { Role } from "../entities/user";

type VerifyToken = (token: string) => {
  id: string; role: Role; userName: string;
};

export default class Authorization {
  constructor(
    private readonly verifyToken: VerifyToken,
  ) {}

  getInfo(authorization: string | undefined) {
    try {
      if (authorization?.startsWith('Token ')) {
        const token = authorization.substring(6);
        return this.verifyToken(token);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private extractRole(authorization: string | undefined): Role | undefined {
    return this.getInfo(authorization)?.role;
  }

  checkUser(authorization?: string): boolean {
    return this.extractRole(authorization) === 'USER';
  }

  checkAdmin(authorization?: string): boolean {
    return this.extractRole(authorization) === 'ADMIN';
  }
}
