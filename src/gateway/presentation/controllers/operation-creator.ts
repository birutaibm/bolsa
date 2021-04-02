import { isNumber, isValidISODate } from '@utils/validators';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';
import { OperationCreationBaseData, OperationCreationData } from '@domain/wallet/usecases/dtos';

import {
  Controller, created, Params, Response
} from '@gateway/presentation/contracts';
import { operationView } from '@gateway/presentation/view/operation';

export class OperationCreatorController extends Controller {
  private readonly basicInfo = ['date', 'quantity', 'value'];
  private readonly requiredParameters = [
    ['positionId'],
    ['assetId', 'walletId'],
    ['assetId', 'walletName', 'investorId'],
    ['assetId', 'walletName', 'investorName', 'userId'],
  ];

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
      throw new InvalidParameterValueError(`Required parameters: ${
        this.requiredParameters.map(
          option => [...this.basicInfo, ...option].join(', ')
        ).join(' or ')
      }.`);
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

  private validateData(params: Params): OperationCreationData {
    const data = this.validateBasicInfo(params.date, params.quantity, params.value, params.authorization);
    delete params.date;
    delete params.quantity;
    delete params.value;
    delete params.authorization;
    const notInParams = (field: string) => !(field in params);
    const allInParams = (fields: string[]) => !fields.find(notInParams);
    for (let i = 0; i < this.requiredParameters.length; i++) {
      const fields = this.requiredParameters[i];
      if (allInParams(fields)) {
        return { ...data, ...params } as OperationCreationData;
      }
    }
    throw new InvalidParameterValueError(`Required parameters: ${
      this.requiredParameters.map(
        option => [...this.basicInfo, ...option].join(', ')
      ).join(' or ')
    }.`);
  }

  protected async tryHandle(params: Params): Promise<Response> {
    const data = this.validateData(params);
    const operation = await this.operationCreator.create(data);
    return created(operationView(operation));
  }
}
