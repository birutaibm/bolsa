import { InvalidTokenFormatError } from "@errors/invalid-token-format";

type TokenVerifier = {
  verifyToken(token: string): object;
}

export function createVerifyToken(verifier: TokenVerifier) {
  return (token: string) => {
    const data = verifier.verifyToken(token);
    if (data && data['role'] && (data['role'] === 'ADMIN' || data['role'] === 'USER')) {
      return { role: data['role'] };
    }
    throw new InvalidTokenFormatError();
  };
}
