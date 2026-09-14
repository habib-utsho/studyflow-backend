export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiErrorDetail[];

  constructor(statusCode: number, message: string, errors?: ApiErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ApiErrorDetail[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = 'Something went wrong'): ApiError {
    return new ApiError(500, message);
  }
}
