type IsSafe<U, T> = T extends U ? T : undefined;

export default class TypeGuard<U> {
  isSafe<T extends string>(candidate?: T): IsSafe<U,T> {
    return candidate as IsSafe<U,T>;
  }
}
