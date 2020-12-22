import { Controller } from '@presentation/contracts';

export async function adaptResolver(controller: Controller): Promise<any> {
  const result = await controller.handle();
  return result.data;
}
