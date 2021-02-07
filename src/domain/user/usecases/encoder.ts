import { hash, compareSync } from 'bcrypt';

export default interface Encoder {
  encode(plain: string): Promise<string>;
  verify(plain: string, encoded: string): boolean
};

export const encoder: Encoder = {
  async encode(plain: string): Promise<string> {
    return hash(plain, 10);
  },

  verify(plain: string, encoded: string): boolean {
    return compareSync(plain, encoded);
  }
};
