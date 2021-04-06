import { hash, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { InvalidTokenFormatError } from '@errors/invalid-input';

import Encoder from '@domain/user/usecases/encoder';

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

  async encode(plain: string): Promise<string> {
    const encoded = await hash(plain, this.salt);
    return encoded;
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
