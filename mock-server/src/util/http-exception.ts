export type ErrorResponse = {
  message: string;
  dev?: unknown;
};

export class HTTPException extends Error {
  readonly statusCode: number;
  readonly error?: unknown;

  constructor(message: string, statusCode: number, error?: unknown) {
    super(message);

    this.error = typeof error !== 'undefined' ? error : '';
    this.statusCode = statusCode;
  }

  public toResponse() {
    const obj: ErrorResponse = { message: this.message };
    if (this.error) {
      obj.dev = this.error;
    }
    return obj;
  }

  public static notFoundErr(error?: unknown) {
    return new HTTPException(
      'The requested resource could not be found.',
      404,
      error
    );
  }

  public static methodErr(error?: unknown) {
    return new HTTPException(
      'The requested action is made using an illegal method.',
      405,
      error
    );
  }

  public static malformedErr(error?: unknown) {
    return new HTTPException(
      'The requested action could not be exercised due to malformed syntax.',
      400,
      error
    );
  }

  public static internalErr(error?: unknown) {
    return new HTTPException(
      'Something went wrong. Please try again later.',
      500,
      error
    );
  }

  public static unprocessableErr(error?: unknown) {
    return new HTTPException(
      'The request was well-formed but not honored.' +
        ' Perhaps the action trying to be performed has already been done?',
      422,
      error
    );
  }

  public static authErr(error?: unknown) {
    return new HTTPException(
      'The provided credentials are either invalid or has' +
        ' insufficient privilege to perform the requested action.',
      401,
      error
    );
  }

  public static getError(error: unknown) {
    const isHttpException = error instanceof HTTPException;
    const isError = error instanceof Error;
    const result: ErrorResponse & { statusCode: number } = {
      statusCode: isHttpException ? error.statusCode : 500,
      message: 'Something went wrong. Please try again.',
    };
    if (isHttpException) {
      const res = error.toResponse();
      result.message = res.message;
      if (res.dev) {
        result.dev = res.dev;
      }
    } else if (isError) {
      result.message = error.message;
    }
    return result;
  }
}
