import { hash, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

import Encoder from '@domain/user/usecases/encoder';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';

export type JwtConfig = {
  privateKey: string;
  publicKey: string;
  options: jwt.SignOptions;
}

export default class Security implements Encoder {
  constructor(
    private readonly salt: number,
    private readonly jwtConfig: JwtConfig,
  ) {}

  encode(plain: string): Promise<string> {
    return hash(plain, this.salt);
  }

  verify(plain: string, encoded: string): boolean {
    return compareSync(plain, encoded);
  }

  createToken(payload: object): string {
    return jwt.sign(
      payload,
      this.jwtConfig.privateKey,
      this.jwtConfig.options,
    );
  }

  verifyToken(token: string): object {
    let value: object;
    try {
      value = jwt.verify(
        token,
        this.jwtConfig.publicKey,
      ) as object;
    } catch (error) {
      throw new InvalidTokenFormatError();
    }
    return value;
  }
}
