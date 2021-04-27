import { SingletonFactory } from '@utils/factory';
import Security, { JwtConfig } from '@gateway/security';
import { env } from '@infra/environment';

export const securityFactory = new SingletonFactory(
  () => {
    const jwtConfig: JwtConfig = {
      publicKey: env.jwt.publicKey,
      privateKey: env.jwt.privateKey,
      options: {
        algorithm: 'RS256',
        expiresIn: env.jwt.duration,
      },
    };
    return new Security(10, jwtConfig);
  }
);
