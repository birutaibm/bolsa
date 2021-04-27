import { TokenVerifier } from './dependencies';

export default class Authorization {
  constructor(
    private readonly tokenVerify: TokenVerifier,
  ) {}

  private getInfo(authorization: string | undefined) {
    try {
      if (authorization?.startsWith('Token ')) {
        const token = authorization.substring(6);
        return this.tokenVerify.verifyToken(token);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private extractRole(authorization: string | undefined): string | undefined {
    const info = this.getInfo(authorization);
    if (!info) return undefined;
    const role = info['role'];
    if (typeof role !== 'string') return undefined;
    return role;
  }

  checkUser(authorization?: string): boolean {
    return this.extractRole(authorization) === 'USER';
  }

  checkAdmin(authorization?: string): boolean {
    return this.extractRole(authorization) === 'ADMIN';
  }

  checkId(id: string, authorization?: string): boolean {
    const info = this.getInfo(authorization);
    if (!info) return false;
    return info['id'] === id;
  }
}
