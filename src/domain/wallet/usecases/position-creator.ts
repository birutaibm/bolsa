import { MayBePromise, Persisted } from '@utils/types';

import { Investor, Position, Wallet } from '@domain/wallet/entities';

import { AssetData, PositionCreationData, PositionData } from './dtos';

interface AssetLoader {
  loadAssetDataById(id: string): MayBePromise<Persisted<AssetData>>
}

export type NewPositionSaver =
  (data: PositionCreationData) => MayBePromise<Persisted<PositionData>>;

export default class PositionCreator {
  constructor(
    private readonly save: NewPositionSaver,
  ) {}

  async create(data: PositionCreationData): Promise<Persisted<Position>> {
    const { id, asset, wallet: {
      id: walletId, name: walletName, owner: { id: ownerId, name: ownerName }
    } } = await this.save(data);
    const investor = new Investor(ownerId, ownerName);
    const wallet = new Wallet(walletId, walletName, investor);
    return new Position(id, asset, wallet);
  }
}
