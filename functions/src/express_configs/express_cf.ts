/**
 * Initialize express & setup all middleware here
 * Do not handle any routes in this file
 */

import express from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from "cors";
import * as bodyParser from "body-parser";
import { Response, Request } from "express";
import logger from "../services/logging";
import { environment } from "../environment";

const app = express();

//setup sentry
if (environment.SENTRY_DNS) {
  Sentry.init({
    dsn: environment.SENTRY_DNS,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
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
    jwksUri: `https://${environment.CLOUDFLARE_DOMAIN}/cdn-cgi/access/certs`,
  }),

  audience: environment.CLOUDFLARE_AUDIENCE,
  issuer: `https://${environment.CLOUDFLARE_AUDIENCE}`,
  algorithms: ["RS256"],
});
//user must be authenticated on auth0 for the requests to go through
app.use(checkJwt);

/**
 * Extract jwt fields aand inject into request body
 */
function extractJWT(request: Request, response: Response, next: () => void) {
  request.body.sub = request.user.sub;
  if ("custom" in request.user) {
    request.body.idp = "auth0";
  } else {
    request.body.idp = "gsuite";
    const identifier = (request.user.email as string).split("@")[0];
    const first_name = identifier.split(".")[0];
    const last_name = identifier.split(".")[1];
    request.body.parsed_name = first_name + " " + last_name;
    request.body.email = request.user.email;
  }
  next();
}
app.use(extractJWT);

function logRequest(request: Request, response: Response, next: () => void) {
  logger.log(request);
  next();
}
app.use(logRequest);

export default app;
