import { Builder } from '@utils/factory';
import { WalletDataLoader } from '@domain/wallet/usecases/wallet-loader';
import { UserRepository, WalletRepository } from '../contracts';
import { PositionRepository } from '../contracts/position-repository';
import { Persisted, PopulatedWalletData, WalletData } from '@domain/wallet/usecases/dtos';
import { WalletNotFoundError } from '@errors/wallet-not-found';

type GetLoggedUserId = () => string;

export class WalletDataLoaderBuilder extends Builder<WalletDataLoader> {
  private getLoggedUserId: GetLoggedUserId;

  constructor(
    private readonly wallets: WalletRepository,
    private readonly positions: PositionRepository,
    private readonly users: UserRepository,
  ) {
    super();
  }

  withGetLoggedUserId(getLoggedUserId: GetLoggedUserId) {
    this.getLoggedUserId = getLoggedUserId;
    return this;
  }

  build(): WalletDataLoader {
    return async (walletId: string): Promise<Persisted<PopulatedWalletData>> => {
      const loggedUserId = this.getLoggedUserId();
      if (!loggedUserId) {
        throw new WalletNotFoundError(walletId);
      }
      const { id, name, ownerId } =
        await this.wallets.loadByIdWithOwnerId(walletId);
      if (loggedUserId !== ownerId){
        throw new WalletNotFoundError(walletId);
      }
      const owner = await this.users.load(ownerId);
      const positions = await this.positions.findByWalletId(id);
      const wallet: Persisted<PopulatedWalletData> = {
        id, name, owner, positions: [],
      }
      wallet.positions = positions.map(position =>
        Object.assign(position, {wallet})
      );
      return wallet;
    }
  }
}
