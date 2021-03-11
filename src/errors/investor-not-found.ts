export class InvestorNotFoundError extends Error {
  constructor(id: string) {
    super(`Investor ${id} not found`);
    this.name = 'InvestorNotFoundError';
  }
}
