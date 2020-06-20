import * as functions from "firebase-functions";
const authFunctions = require('./auth/auth');
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const express = require("express");
const cors = require("cors");

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));


/**
 * Only handle routes and connecting them to functions here
 */

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

// Add middleware to authenticate requests

app.get('/getCustomToken',checkJwt, authFunctions.createCustomToken);
app.post('/createTestUser', authFunctions.createTestUser);
app.get('/hello-world', (req: any, res: any) => {
    res.send("hello world!");
})

exports.api = functions.https.onRequest(app);