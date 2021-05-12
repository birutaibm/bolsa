import { SingletonFactory } from '@utils/factory';

import Security, { JwtConfig } from '@gateway/security';

export function securityFactory(config: JwtConfig) {
  return new SingletonFactory(() => new Security(10, config));
}
