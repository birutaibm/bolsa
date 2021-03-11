import { notNull } from '@utils/validators';
import { DatabaseOperationError } from '@errors/database-operation';
import { InvestorNotFoundError } from '@errors/investor-not-found';

import { PersistedWalletData, WalletData, WalletRepository } from '@gateway/data/contracts';

import { Users, WalletDocument, Wallets } from '@infra/data-source/model';

import Mongo from '..';

export class MongoWalletRepository implements WalletRepository {
  constructor(
    private readonly mongo: Mongo,
  ) {}

  async loadWalletDataById(id: string): Promise<WalletData> {
    const model = notNull(await Wallets.findById(id));
    return this.documentToData(model);
  }

  async loadWalletsDataByIds(ids: string[]): Promise<WalletData[]> {
    const models = await Wallets.find({ _id: { $in: ids }});
    return models.map(this.documentToData);
  }

  async saveNewWallet(
    walletName: string, investorId: string
  ): Promise<PersistedWalletData> {
    const session = await this.mongo.startSession();
    try {
      session.startTransaction()
      const owner = await Users.findById(investorId).session(session);
      if (!owner) {
        throw new InvestorNotFoundError(investorId);
      }
      const [wallet] = await Wallets.create([{name: walletName, ownerId: investorId}], {session});
      if (!wallet.id) {
        throw new DatabaseOperationError('create wallet');
      }
      owner.walletIds.push(wallet.id);
      await owner.save();
      await session.commitTransaction();
      session.endSession();
      return {
        id: wallet.id, name: wallet.name, owner,
      };
    } catch (error) {
      return session.abortTransaction().then(() => {
        session.endSession();
        throw error;
      });
    }
  }

  private documentToData(
    { id, name, ownerId, positionIds, }: WalletDocument
  ): WalletData {
    return {
      id, name, ownerId: ownerId.toHexString(),
      positionIds: positionIds.map(pos => pos.toHexString()),
    };
  }
}
