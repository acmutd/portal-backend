/**
 * Initialize express & setup all middleware here
 * Do not handle any routes in this file
 */

import * as functions from "firebase-functions";
import express from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from "cors";
import * as bodyParser from "body-parser";
import { Response, Request } from "express";

const app = express();

//setup sentry
if (functions.config()?.sentry?.dns) {
  Sentry.init({
    dsn: functions.config().sentry.dns,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
}

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// The error handler must be before any other error middleware and after all controllers
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors over 400
      if ((error.status as number) >= 400) {
        return true;
      }
      return false;
    },
  })
);

function errorHandler(error: Error, request: Request, response: Response, next: (err?: Error) => void) {
  Sentry.captureException(error);
  response.status(500).json({
    message: "Error encountered",
    error: error,
  });
  next(error); //just incase we have additional error handlers
}
app.use(errorHandler);

// Automatically send uncaught exception errors to Sentry
process.on("uncaughtException", (err) => Sentry.captureException(err));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${functions.config().auth0.domain}/.well-known/jwks.json`,
  }),

  audience: functions.config().auth0.audience,
  issuer: `https://${functions.config().auth0.domain}/`,
  algorithms: ["RS256"],
});
//uåser must be authenticated on auth0 for the requests to go through
app.use(checkJwt);

export default app;
