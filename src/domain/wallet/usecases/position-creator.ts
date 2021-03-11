import { Position } from '@domain/wallet/entities';
import { AssetData, MayBePromise, Persisted, PositionData } from './dtos';
import WalletLoader from './wallet-loader';

export type NewPositionSaver =
  (asset: AssetData, walletId: string, loggedUserId: string) => MayBePromise<Persisted<PositionData>>;

export default class PositionCreator {
  constructor(
    private readonly save: NewPositionSaver,
    private readonly wallets: WalletLoader,
  ) {}

  async create(asset: AssetData, walletId: string, loggedUserId: string): Promise<Persisted<Position>> {
    const wallet = await this.wallets.load(walletId, loggedUserId);
    const position = new Position(asset, wallet);
    const { id } = await this.save(asset, walletId, loggedUserId);
    return Object.assign(position, {id});
  }
}
