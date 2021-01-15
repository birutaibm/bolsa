export type Response<T = any> = {
  statusCode: number;
  data: T;
};

export function ok<T = any>(data: T): Response<T> {
  return {
    statusCode: 200,
    data,
  };
};

export function created<T = any>(data: T): Response<T> {
  return {
    statusCode: 201,
    data,
  };
};

export function serverError(error: Error): Response {
  return {
    statusCode: 500,
    data: error.stack
  };
};
