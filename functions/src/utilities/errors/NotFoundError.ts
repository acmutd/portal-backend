import { CustomError } from "./CustomError";

export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor(message: string, errors: any[]) {
    super(message, errors);
  }
}
