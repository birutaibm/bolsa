import { MayBePromise, Persisted } from '@utils/types';

import { Position } from '@domain/wallet/entities';

import { AssetData, CheckLoggedUserId } from './dtos';
import WalletLoader from './wallet-loader';

interface AssetLoader {
  loadAssetDataById(id: string): MayBePromise<Persisted<AssetData>>
}

export type NewPositionSaver =
  (assetId: string, walletId: string) => MayBePromise<string>;

export default class PositionCreator {
  constructor(
    private readonly save: NewPositionSaver,
    private readonly wallets: WalletLoader,
    private readonly assets: AssetLoader,
  ) {}

  async create(assetId: string, walletId: string, isLogged: CheckLoggedUserId): Promise<Persisted<Position>> {
    const wallet = await this.wallets.load(walletId, isLogged);
    const asset = await this.assets.loadAssetDataById(assetId)
    const position = new Position(asset, wallet);
    const id = await this.save(assetId, walletId);
    return Object.assign(position, {id});
  }
}
