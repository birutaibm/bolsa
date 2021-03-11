import { notNull } from '@utils/validators';
import { DatabaseOperationError } from '@errors/database-operation';
import { WalletNotFoundError } from '@errors/wallet-not-found';

import {
  PositionData, PositionRepository, PositionWithWalletData, AssetData
} from '@gateway/data/contracts/position-repository';

import Positions, { PositionDocument } from '@infra/data-source/model/position';
import { Wallets } from '@infra/data-source/model';

import Mongo from '..';

export class MongoPositionRepository implements PositionRepository {
  constructor(
    private readonly mongo: Mongo,
  ) {}

  async loadPositionDataById(id: string): Promise<PositionData> {
    const model = notNull(await Positions.findById(id));
    return this.documentToData(model);
  }

  async loadPositionsDataByIds(ids: string[]): Promise<PositionData[]> {
    const models = await Positions.find({ _id: { $in: ids }});
    return models.map(this.documentToData);
  }

  async saveNewPosition(asset: AssetData, walletId: string): Promise<PositionWithWalletData> {
    const session = await this.mongo.startSession();
    try {
      session.startTransaction()
      const wallet = await Wallets.findById(walletId).session(session);
      if (!wallet) {
        throw new WalletNotFoundError(walletId);
      }
      const [position] = await Positions.create([{asset, walletId}], {session});
      if (!position.id) {
        throw new DatabaseOperationError('create position');
      }
      wallet.positionIds.push(position.id);
      await wallet.save();
      await session.commitTransaction();
      session.endSession();
      return {
        id: position.id, asset: position.asset, wallet: {
          id: wallet.id,
          name: wallet.name,
          ownerId: wallet.ownerId.toHexString(),
        },
      };
    } catch (error) {
      return session.abortTransaction().then(() => {
        session.endSession();
        throw error;
      });
    }
  }

  private documentToData(
    { id, asset, walletId, operationIds }: PositionDocument
  ): PositionData {
    return {
      id, asset, walletId: walletId.toHexString(),
      operationIds: operationIds.map(op => op.toHexString()),
    };
  }
}
