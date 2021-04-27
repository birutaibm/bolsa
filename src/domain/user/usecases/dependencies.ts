import { MayBePromise } from '@utils/types';

import { PersistedUserData, UserData } from './dto';

export interface Encoder {
  encode(plain: string): MayBePromise<string>;
  verify(plain: string, encoded: string): boolean;
};

export interface TokenCreator {
  createToken(payload: object): string;
}

export interface TokenVerifier {
  verifyToken(token: string): object;
}

export type LoadPersistedUserDataFromUsername =
  (userName: string) => MayBePromise<PersistedUserData>;

export type SaveUserData = (user: UserData) => MayBePromise<{id: string}>;
