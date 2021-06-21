import * as Sentry from "@sentry/node";
import { Request, Response } from "express";
import logger from "./logging";

interface errorMessage {
  message: string;
}
interface errorResponse {
  error: errorMessage;
}
export class ErrorService {
  static generatePostError<T>(reqObj: Record<string, unknown>, exampleObj: T): errorResponse | null {
    const response = { error: { message: "You are missing the " } };
    const missing: string[] = [];
    const wrongType: { key: string; type: string; correct: string }[] = [];
    for (const key in exampleObj) {
      if (Object.keys(reqObj).includes(key)) {
        if (typeof exampleObj[key] !== typeof reqObj[key])
          wrongType.push({ key, type: typeof reqObj[key], correct: typeof exampleObj[key] });
      } else missing.push(key);
    }
    if (missing.length == 0) return null;

    missing.forEach((key, index) => {
      response.error.message += index + 1 != missing.length ? `'${key}', ` : `and '${key}' key(s).`;
    });

    wrongType.forEach(
      (el) =>
        (response.error.message += ` You gave the '${el.key}' key a '${el.type}' type, when it should be a '${el.correct}' type.`)
    );

    return response;
  }
}

export const debug_sentry = (request: Request, response: Response): void => {
  try {
    throw new Error("My first Sentry error!");
  } catch (error) {
    Sentry.captureException(error);
    Sentry.flush(2000);
    logger.log(error);
  }
  response.json({
    error: "Sentry debug error",
  });
};
