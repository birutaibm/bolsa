export default class NotFoundError extends Error {
  constructor(resource: string, identification: string) {
    super(`${resource} ${identification} not found`);
  }
}
