/**
 * Initialize express & setup all middleware here
 * Do not handle any routes in this file
 */

import express from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from "cors";
import * as bodyParser from "body-parser";
import { environment } from "../environment";

const app = express();

//setup sentry
if (environment.SENTRY_DNS)
  Sentry.init({
    dsn: environment.SENTRY_DNS,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors({ origin: true }));
// app.use(bodyParser.raw({ type: "application/json" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// The error handler must be before any other error middleware and after all controllers
app.use(
  Sentry.Handlers.errorHandler({
    // report the error to sentry if >=400
    shouldHandleError: (error) => (error.status as number) >= 400,
  })
);

function errorHandler(error: Error, request: any, response: any, next: (err?: Error) => void) {
  Sentry.captureException(error);
  response.status(500).json({
    message: "Error encountered",
    error: error,
  });
  next(error); //just incase we have additional error handlers
}
app.use(errorHandler);

// this pollutes log files too much
// function logRequest(request: Request, response: Response, next: () => void) {
//   logger.log(request);
//   next();
// }
// app.use(logRequest);

export default app;
