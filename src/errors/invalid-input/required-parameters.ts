import { InvalidParameterValueError } from './invalid-parameter-value';

export class RequiredParameterError extends InvalidParameterValueError {
  constructor(
    private readonly parameters: string[][],
  ) {
    super(`Required parameters: ${
      parameters
        .filter(option => option.length > 0)
        .map(option => {
          const last = option.pop();
          return option.length > 0 ? `${option.join(', ')} and ${last}` : last;
        })
        .join(' or ')
    }.`);
    this.name = 'RequiredParameterError';
  }
}
