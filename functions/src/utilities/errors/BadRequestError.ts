import { CustomError } from "./CustomError";

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(message: string, errors: any[]) {
    super(message, errors);
  }
}
