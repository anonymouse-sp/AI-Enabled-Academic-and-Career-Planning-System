export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors: any[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation Error', errors: any[] = []) {
    super(message, 400, errors);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication Error') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Authorization Error') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource Not Found') {
    super(message, 404);
  }
}