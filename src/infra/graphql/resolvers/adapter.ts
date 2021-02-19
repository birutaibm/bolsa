import { Controller, Params } from '@gateway/presentation/contracts';

export async function adaptResolver(controller: Controller, params: Params = {}): Promise<any> {
  const result = await controller.handle(params);
  return result.data;
}
