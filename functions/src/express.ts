/**
 * Initialize express & setup all middleware here
 * Do not handle any routes in this file
 */

import * as functions from "firebase-functions";
import express from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import * as Sentry from "@sentry/node";
import cors from "cors";

const app = express();

//setup sentry
if (functions.config().sentry && functions.config().sentry.dns) Sentry.init({ dsn: functions.config().sentry.dns });

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${functions.config().auth0.domain}/.well-known/jwks.json`,
  }),

  audience: functions.config().auth0.audience,
  issuer: `https://${functions.config().auth0.domain}/`,
  algorithm: ["RS256"],
});
//user must be authenticated on auth0 for the requests to go through
app.use(checkJwt);

export default app;
