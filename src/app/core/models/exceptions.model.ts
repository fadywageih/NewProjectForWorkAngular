export class AppException {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: string[]
  ) {}
}
export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, 404);
  }
}
export class UnauthorizedException extends AppException {
  constructor(message: string = 'Invalid email or password') {
    super(message, 401);
  }
}
export class ValidationException extends AppException {
  constructor(errors: string[]) {
    super('One or more validation errors occurred.', 400, errors);
  }
}