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

export function clientError(message: string): Response {
  return {
    statusCode: 400,
    data: { message },
  };
};

export function unauthorized(message: string): Response {
  return {
    statusCode: 401,
    data: { message },
  };
};

export function notFoundError(message: string): Response {
  return {
    statusCode: 404,
    data: { message },
  };
};

export function serverError(error: Error): Response {
  console.error(error);
  return {
    statusCode: 500,
    data: {
      error: error.name,
      message: error.message,
    },
  };
};