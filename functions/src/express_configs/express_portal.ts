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
import { environment } from "../environment";
import { requireField, validateRequest } from "../services/validate-request";

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

app.use(
  cors({
    // Split the environment variable on a sequence of one or more commas or spaces
    origin: environment.URL_ORIGINS?.trim().split(/[\s,]+/),
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// The error handler must be before any other error middleware and after all controllers
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors over 400
      Sentry.captureException(error);
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

const checkJwt_auth0 = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${environment.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: environment.AUTH0_AUDIENCE,
  issuer: `https://${environment.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

const checkJwt_gsuite = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${environment.CLOUDFLARE_DOMAIN}/cdn-cgi/access/certs`,
  }),

  audience: environment.CLOUDFLARE_PORTAL_GSUITE_AUDIENCE,
  issuer: `https://${environment.CLOUDFLARE_DOMAIN}`,
  algorithms: ["RS256"],
});
//user must be authenticated on auth0 for the requests to go through
app.use("/auth0", checkJwt_auth0);
// user must be authenticated on gsuite for the requests to go through
app.use("/gsuite", checkJwt_gsuite);

function extractAuth0Fields(request: Request, response: Response, next: () => void) {
  request.body.sub = request.user.sub;
  request.body.email = request.user["https://acmutd.co/email"];
  request.body.idp = "auth0";
  next();
}
app.use(extractAuth0Fields);

app.use(
  "/gsuite/vanity/create",
  [
    requireField({
      fieldName: "first_name",
      onErrorMsg: "First name is required",
    }),
    requireField({
      fieldName: "last_name",
      onErrorMsg: "Last name is required",
    }),
    requireField({
      fieldName: "destination",
      onErrorMsg: "Destination URL is required",
    }),
    requireField({
      fieldName: "primary_domain",
      onErrorMsg: "Primary domain is required",
    }),
    requireField({
      fieldName: "subdomain",
      onErrorMsg: "Subdomain is required",
    }),
    requireField({
      fieldName: "slashtag",
      onErrorMsg: "Slashtag is required",
    }),
  ],
  validateRequest({ onErrorMsg: "Failed to create Vanity link" })
);

/**
 * Log entire request
 */
// function logRequest(request: Request, response: Response, next: () => void) {
//   logger.log(request);
//   next();
// }
// app.use(logRequest);

/**
 * Extract jwt fields and inject into request body
 * Use for parsing G Suite name from cloudflare access token
 */
// function extractJWT(request: Request, response: Response, next: () => void) {
//   if (request.user.aud.includes(functions.config().auth0.audience)) {
//     request.body.idp = "auth0";
//   } else {
//     request.body.idp = "gsuite";
//     const identifier = (request.user.email as string).split("@")[0];
//     const first_name = identifier.split(".")[0];
//     const last_name = identifier.split(".")[1];
//     request.body.parsed_name = first_name + " " + last_name;
//   }
//   next();
// }
// app.use(extractJWT);

export default app;
