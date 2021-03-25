export type Persisted<T> = T & { id: string };
export type MayBePromise<T> = T | Promise<T>;
