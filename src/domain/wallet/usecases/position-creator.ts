import { Position } from '@domain/wallet/entities';
import { AssetData, MayBePromise, Persisted, PositionData } from './dtos';
import WalletLoader from './wallet-loader';

interface AssetLoader {
  loadAssetDataById(id: string): MayBePromise<AssetData>
}

export type NewPositionSaver =
  (assetId: string, walletId: string, loggedUserId: string) => MayBePromise<Persisted<PositionData>>;

export default class PositionCreator {
  constructor(
    private readonly save: NewPositionSaver,
    private readonly wallets: WalletLoader,
    private readonly assets: AssetLoader,
  ) {}

  async create(assetId: string, walletId: string, loggedUserId: string): Promise<Persisted<Position>> {
    const wallet = await this.wallets.load(walletId, loggedUserId);
    const asset = await this.assets.loadAssetDataById(assetId)
    const position = new Position(asset, wallet);
    const { id } = await this.save(assetId, walletId, loggedUserId);
    return Object.assign(position, {id});
  }
}
