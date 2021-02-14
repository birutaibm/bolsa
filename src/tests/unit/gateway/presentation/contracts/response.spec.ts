import { ok, created, clientError, notFoundError, serverError } from "@gateway/presentation/contracts";

describe('Controller responses', () => {
  it('should be able to create an ok response', () => {
    const content = { success: true };
    const response = ok(content);
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual(content);
  });

  it('should be able to create a created response', () => {
    const content = { success: true };
    const response = created(content);
    expect(response.statusCode).toBe(201);
    expect(response.data).toEqual(content);
  });

  it('should be able to create a client error response', () => {
    const message = 'I can not understand your request';
    const response = clientError(message);
    expect(response.statusCode).toBe(400);
    expect(response.data).toEqual({ message });
  });

  it('should be able to create a not found error response', () => {
    const message = 'I can not found this resource';
    const response = notFoundError(message);
    expect(response.statusCode).toBe(404);
    expect(response.data).toEqual({ message });
  });

  it('should be able to create an server error response', () => {
    const message = 'Something went wrong';
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const response = serverError(new Error(message));
    expect(response.statusCode).toBe(500);
    expect(response.data).toEqual(expect.objectContaining({ message }));
  });
});
