import { SingletonFactory } from '@utils/factory';
import CreateOperation from '@domain/wallet/usecases/create-operation';
import { WalletRepository } from '@gateway/data/contracts';
import { WalletDTO } from '@gateway/data/dto';

export default function createWalletUseCasesFactories(
  repository: WalletRepository,
) {
  const loadWalletData = (wallet: string, owner: string) =>
    repository.getWalletFromNameAndOwner(wallet, owner);
  const persistWalletData = (wallet: WalletDTO) => repository.save(wallet);
  const creator = new SingletonFactory(
    () => new CreateOperation(loadWalletData, persistWalletData)
  );

  return {
    creator,
  };
}
