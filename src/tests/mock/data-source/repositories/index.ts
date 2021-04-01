import { RepositoryChangeCommandExecutor } from '@gateway/data/contracts';

export * from './internal-price';
export * from './external-price';
export * from './user';
export * from './investors';
export * from './wallets';
export * from './positions';
export * from './operations';

export const executor: RepositoryChangeCommandExecutor<void> = {
  append: (command) => command(),
  execute: () => {},
  cancel: () => {},
}
