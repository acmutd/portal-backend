import logdna from "@logdna/logger";
import { environment } from "./environment";

const options: logdna.ConstructorOptions = {
  app: "acm-core",
  env: process.env.NODE_ENV,
  // level: logdna.LogLevel.debug, // set a default for when level is not provided in function calls
};

const harsha_logger = logdna.createLogger(`${environment.LOGDNA_HARSHA}`, options);

class Logger {
  private logdna_loggers = [harsha_logger /*, insert additional loggers */];

  log = (message: string | Request | Record<string, unknown>, ...fields: any[]): void => {
    this.logdna_loggers.forEach((element) => {
      element.log(message);
    });
  };
}

const logger = new Logger();

export default logger;
