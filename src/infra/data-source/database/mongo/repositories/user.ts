import { notNull } from '@utils/validators';
import { UserNotFoundError } from '@errors/user-not-found';

import {
  InvestorDTO, InvestorRepository, UserRepository
} from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import Users, { UserDocument } from '@infra/data-source/model/user';

export class MongoUserRepository implements UserRepository, InvestorRepository {
  async loadInvestorDataById(id: string): Promise<InvestorDTO> {
    const model = notNull(await Users.findById(id));
    return this.documentToInvestorData(model);
  }

  private documentToInvestorData({id, name, walletIds}: UserDocument): InvestorDTO {
    return { id, name, walletIds };
  }

  async load(id: string): Promise<UserDTO & InvestorDTO> {
    return notNull(await Users.findById(id));
  }

  async saveNewInvestor(investor: InvestorDTO): Promise<InvestorDTO> {
    const model = notNull(await Users.findById(investor.id));
    model.name = investor.name;
    model.walletIds = investor.walletIds;
    await model.save();
    return investor;
  }

  async getUserFromUsername(userName: string): Promise<UserDTO & {id: any}> {
    const user = await Users.findOne({ userName });
    if (user) {
      return user;
    }
    throw new UserNotFoundError(userName);
  }

  async saveUser(user: UserDTO): Promise<void> {
    const created = await Users.create(user);
    await created.save();
  }
}
