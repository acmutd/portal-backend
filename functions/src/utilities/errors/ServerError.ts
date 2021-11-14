import { CustomError } from "./CustomError";

export class ServerError extends CustomError {
  statusCode = 500;
  constructor(message: string, errors: any[]) {
    super(message, errors);
  }
}
