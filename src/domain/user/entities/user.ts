export type Role = 'USER' | 'ADMIN';

type PassVerifier = (plain: string, encoded: string) => boolean;

export default class User {
  public readonly checkPassword: (password: string) => boolean;

  constructor(
    readonly userName: string,
    readonly passHash: string,
    readonly role: Role,
    verify: PassVerifier,
  ) {
    this.checkPassword = (password: string) => verify(password, this.passHash);
  }
}
