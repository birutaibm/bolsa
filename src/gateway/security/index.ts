import { hash, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { InvalidTokenFormatError } from '@errors/invalid-input';

import { Encoder, TokenCreator, TokenVerifier } from '@domain/user/usecases';

export type JwtConfig = {
  privateKey: string;
  publicKey: string;
  options: jwt.SignOptions;
}

export interface ISecurity extends Encoder, TokenCreator, TokenVerifier {}

export default class Security implements ISecurity {
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

  verifyToken(token: string) {
    try {
      const value = jwt.verify(
        token,
        this.jwtConfig.publicKey,
      );
      if (typeof value !== 'object') throw new InvalidTokenFormatError();
      return value;
    } catch (error) {
      throw new InvalidTokenFormatError();
    }
  }
}
