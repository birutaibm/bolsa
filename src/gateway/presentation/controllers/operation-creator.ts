import { isNumber, isValidISODate } from '@utils/validators';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response
} from '@gateway/presentation/contracts';
import { operationView } from '../view/operation';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { OperationCreationBaseData } from '@domain/wallet/usecases/dtos';

export class OperationCreatorController extends Controller {
  constructor(
    private readonly operationCreator: OperationCreator,
    private readonly auth: Authorization,
  ) {
    super();
  }

  private validateBasicInfo(
    date?: string, quantity?: string, value?: string, authorization?: string
  ): OperationCreationBaseData {
    if (!date || !quantity || !value) {
      throw new InvalidParameterValueError(
        'Required parameters: date, quantity, value'
      );
    }
    if (!isValidISODate(date)) {
      throw new InvalidParameterValueError('Date must be in ISO format');
    }
    if (!isNumber(quantity) || !isNumber(value)) {
      throw new InvalidParameterValueError(
        'Quantity and value must be cast to valid numbers'
      );
    }
    return {
      isLogged: (id: string) => this.auth.checkId(id, authorization),
      date: new Date(date),
      quantity: Number(quantity),
      value: Number(value),
    };
  }

  protected async tryHandle({
    date, quantity, value, authorization, positionId, assetId, walletId,
    walletName, investorId,
  }: Params): Promise<Response> {
    const data = this.validateBasicInfo(date, quantity, value, authorization);
    if (positionId) {
      const operation = await this.operationCreator.create({
        ...data, positionId,
      });
      return created(operationView(operation));
    } if (!assetId) {
      return clientError('Required parameters: positionId or assetId');
    }
    if (walletId) {
      const operation = await this.operationCreator.create({
        ...data, assetId, walletId,
      });
      return created(operationView(operation));
    }
    if (!walletName) {
      return clientError('Required parameters: walletId or walletName');
    }
    if (investorId) {
      const operation = await this.operationCreator.create({
        ...data, assetId, walletName, investorId,
      });
      return created(operationView(operation));
    }
    return clientError('Required parameters: investorId');
  }
}
