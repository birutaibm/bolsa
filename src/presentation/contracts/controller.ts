import { Response } from '@presentation/contracts';

export interface Controller<I = void> {
  handle: (request: I) => Promise<Response>
}
