import { InvalidTokenFormatError } from "@errors/invalid-token-format";

type TokenVerifier = {
  verifyToken(token: string): object;
}

export function createVerifyToken(verifier: TokenVerifier) {
  return (token: string) => {
    const data = verifier.verifyToken(token);
    if (data && data['role'] && data['userName'] && data['id'] &&
      (data['role'] === 'ADMIN' || data['role'] === 'USER')
    ) {
      return {
        id: data['id'],
        role: data['role'],
        userName: data['userName'],
      };
    }
    throw new InvalidTokenFormatError();
  };
}
