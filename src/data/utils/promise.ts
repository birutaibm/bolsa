export const promise = {
  async noRejection<T>(provider: () => Promise<T>, def = {} as T): Promise<T> {
    try {
      const result = await provider();
      return result;
    } catch (error) {
      return def;
    }
  },
};
