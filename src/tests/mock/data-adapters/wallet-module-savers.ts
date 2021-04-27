import { SignInRequiredError } from '@errors/sign-in-required';
import {
  AssetNotFoundError, InvestorNotFoundError, PositionNotFoundError,
  WalletNotFoundError
} from '@errors/not-found';
import { Persisted } from '@utils/types';

import {
  AssetData, InvestorData, WalletData, PositionData
} from '@domain/wallet/usecases/dtos';
import { NewOperationSaver } from '@domain/wallet/usecases/operation-creator';
import { NewPositionSaver } from '@domain/wallet/usecases/position-creator';
import { NewWalletSaver } from '@domain/wallet/usecases/wallet-creator';
import { NewInvestorSaver } from '@domain/wallet/usecases/investor-creator';
import { company, datatype, finance, name } from 'faker';

export default class WalletModuleSavers {
  readonly position: Persisted<PositionData>;
  readonly wallet: Persisted<WalletData>;
  readonly asset: Persisted<AssetData>;
  readonly owner: InvestorData;
  readonly invalidInDB: string;

  constructor() {
    this.asset = { id: datatype.uuid(), ticker: datatype.string(5), name: company.companyName() };
    this.owner = { id: datatype.uuid(), name: name.findName() };
    this.wallet = { id: datatype.uuid(), name: finance.accountName(), owner: this.owner };
    this.position = { id: datatype.uuid(), wallet: this.wallet, asset: this.asset };
    this.invalidInDB = 'Invalid value in db rules';
  }

  newOperation: NewOperationSaver = async data => {
    if (!data.isLogged(this.owner.id))
      throw new SignInRequiredError();
    if ('positionId' in data) {
      if (data.positionId === this.invalidInDB)
        throw new Error("");
      else if (this.position.id !== data.positionId)
        throw new PositionNotFoundError(data.positionId);
      return {
        id: 'operationId', position: this.position,
        date: data.date, quantity: data.quantity, value: data.value,
      };
    }
    return {
      id: 'operationId', position: await this.newPosition(data),
      date: data.date, quantity: data.quantity, value: data.value,
    };
  };

  newPosition: NewPositionSaver = async data => {
    if (!data.isLogged(this.owner.id)) throw new SignInRequiredError();
    if (data.assetId !== this.asset.id) throw new AssetNotFoundError(data.assetId);
    if ('walletId' in data) {
      if (data.walletId === this.invalidInDB) {
        throw new Error("");
      } else if (data.walletId !== this.wallet.id) {
        throw new WalletNotFoundError(data.walletId);
      }
      return {
        id: 'positionId', asset: this.asset, wallet: this.wallet,
      };
    }
    return {
      id: 'positionId', asset: this.asset, wallet: await this.newWallet(data),
    };
  };

  newWallet: NewWalletSaver = async data => {
    if (!data.isLogged('investorId' in data ? data.investorId: data.userId))
      throw new SignInRequiredError();
    if ('investorId' in data) {
      if (data.walletName === this.invalidInDB) {
        throw new Error("");
      } else if (data.investorId !== this.owner.id) {
        throw new InvestorNotFoundError(data.investorId);
      }
      return {
        id: 'walletId', name: data.walletName,
        owner: this.owner,
      };
    }
    return {
      id: 'walletId', name: data.walletName,
      owner: await this.newInvestor({id: data.userId, name: data.investorName}),
    };
  };

  newInvestor: NewInvestorSaver = data => {
    if (data.name === this.invalidInDB) {
      throw new Error("");
    }
    return {id: data.id, name: data.name, walletIds: []};
  };
}
