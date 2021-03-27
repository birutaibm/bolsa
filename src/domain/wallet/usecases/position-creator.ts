import { MayBePromise, Persisted } from '@utils/types';

import { Position } from '@domain/wallet/entities';

import { AssetData, CheckLoggedUserId, PositionCreationData } from './dtos';
import WalletLoader from './wallet-loader';
import WalletCreator from './wallet-creator';

interface AssetLoader {
  loadAssetDataById(id: string): MayBePromise<Persisted<AssetData>>
}

export type NewPositionSaver =
  (assetId: string, walletId: string) => MayBePromise<string>;

export default class PositionCreator {
  constructor(
    private readonly save: NewPositionSaver,
    private readonly assets: AssetLoader,
    private readonly wallets: WalletLoader,
    private readonly walletCreator: WalletCreator,
  ) {}

  async create(
    {assetId, ...data}: PositionCreationData
  ): Promise<Persisted<Position>> {
    const wallet = await this.getWallet(data);
    const asset = await this.assets.loadAssetDataById(assetId)
    const position = new Position(asset, wallet);
    const id = await this.save(assetId, wallet.id);
    return Object.assign(position, {id});
  }

  private async getWallet(
    data: { walletId: string; isLogged: CheckLoggedUserId; }
      | { walletName: string; investorId: string; isLogged: CheckLoggedUserId; },
  ) {
    if ('walletId' in data) {
      return await this.wallets.load(data.walletId, data.isLogged);
    }
    return await this.walletCreator.create(
      { name: data.walletName, investorId: data.investorId, }, data.isLogged,
    );
  }
}
