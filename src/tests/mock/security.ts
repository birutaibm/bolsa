import { Encoder, TokenCreator, TokenVerifier } from '@domain/user/usecases';
import { InvalidTokenFormatError } from '@errors/invalid-input';

export const encoder: Encoder = {
  encode: plain => Promise.resolve(plain),
  verify: (plain, encoded) => plain === encoded,
}

export const tokenCreator: TokenCreator = {
  createToken: (payload: object) => JSON.stringify(payload),
}

export const tokenVerifier = {
  compatibleWithCreator(): TokenVerifier {
    return { verifyToken: (token: string) => JSON.parse(token) };
  },
  with(tokens: {[token: string]: object}): TokenVerifier {
    return { verifyToken: token => {
      if (tokens[token]) return tokens[token];
      throw new InvalidTokenFormatError();
    } };
  }
}
