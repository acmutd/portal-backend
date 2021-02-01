import logdna from "@logdna/logger";
import { Request, Response } from "express";
import * as functions from "firebase-functions";

const options: logdna.ConstructorOptions = {
  app: "acm-core",
  env: process.env.NODE_ENV,
  // level: logdna.LogLevel.debug, // set a default for when level is not provided in function calls
};

const harsha_logger = logdna.createLogger(functions.config().logdna.harsha, options);

class Logger {
  private logdna_loggers = [harsha_logger /*, insert additional loggers */];

  log = (message: string | Request | Record<string, unknown>, ...fields: any[]): void => {
    this.logdna_loggers.forEach((element) => {
      element.log(message);
    });
  };
}

const logger = new Logger();

export const debug_logger = (request: Request, response: Response): void => {
  logger.log("testing logging endpoint");
  response.json({
    message: "Successful execution of debug logger endpoint",
  });
};

export default logger;
