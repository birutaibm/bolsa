import { MultipleErrors } from "@errors/multiple-errors";

type Results<T> = {
  resolved: T[];
  rejected: Error[];
};

export const promise = {
  async noRejection<T>(provider: () => Promise<T>, def = {} as T): Promise<T> {
    try {
      const result = await provider();
      return result;
    } catch (error) {
      return def;
    }
  },

  async all<T>(promises: Array<Promise<T>>): Promise<Results<T>> {
    const resolved: {[key: number]: T} = {};
    const rejected: {[key: number]: Error} = {};
    return new Promise((resolve, reject) => {
      let pending = promises.length;
      const finishStep = () => {
        pending--;
        if (pending === 0) {
          if (Object.values(resolved).length > 0) {
            resolve({
              resolved: Object.values(resolved),
              rejected: Object.values(rejected),
            });
          } else {
            reject(new MultipleErrors(Object.values(rejected)));
          }
        }
      };
      promises.forEach((p, i) => p.then(
        result => {
          resolved[i] = result;
          finishStep();
        },
        error => {
          rejected[i] = error;
          finishStep();
        },
      ));
    });
  }
};
