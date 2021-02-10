export default interface Encoder {
  encode(plain: string): Promise<string>;
  verify(plain: string, encoded: string): boolean
};
