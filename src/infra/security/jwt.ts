import jwt from 'jsonwebtoken';

import { env } from '@infra/environment';

export function signIn(payload: object): string {
  return jwt.sign(
    payload,
    env.jwt.privateKey,
    {
      algorithm: 'RS256',
      expiresIn: env.jwt.duration,
    }
  );
}

export function verify(token: string) {
  return jwt.verify(
    token,
    env.jwt.publicKey,
  );
}
