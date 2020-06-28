/**
 * Initialize express & setup all middleware here
 * Do not handle any routes in this file
 */

import * as functions from "firebase-functions";

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const app = express();

app.use(cors({ origin: true }));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

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