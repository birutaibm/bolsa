import NotFoundError from '.';

export class InvestorNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Investor', id);
    this.name = 'InvestorNotFoundError';
  }
}
