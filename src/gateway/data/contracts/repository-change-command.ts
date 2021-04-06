import { MayBePromise } from '@utils/types';

export type RepositoryChangeCommandExecutor<E=any> = {
  append<T>(command: RepositoryChangeCommand<T,E>): MayBePromise<T>;
  execute(): MayBePromise<void>;
  cancel(): MayBePromise<void>;
};

export type RepositoryChangeCommand<T,E=any> = (executor: E) => MayBePromise<T>;

export interface RepositoryChangeCommandExecutors<E=any> {
  singleCommandExecutor<T>(command: RepositoryChangeCommand<T, E>): MayBePromise<T>;
  multiCommandExecutor(): MayBePromise<RepositoryChangeCommandExecutor<E>>;
}
