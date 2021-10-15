export abstract class CustomError extends Error {
  statusCode = 500;
  constructor(message: string, public errors: any[]) {
    super(message);
  }
  serialize() {
    return {
      message: this.message,
      errors: this.errors,
    };
  }
}
