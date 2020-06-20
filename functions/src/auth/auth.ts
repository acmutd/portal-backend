import * as functions from "firebase-functions";
import { auth, firestore } from "../admin/admin";
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

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

/**
 * Receive the {getTokenSilently} from auth0
 */
const createCustomToken = functions.https.onRequest(
  (request: any, response) => {
    const { sub: uid } = request.user;

    const firebaseToken = auth
      .createCustomToken(uid)
      .then((customToken) => {
        response.json({ firebaseToken });
      })
      .catch(function (error) {
        response.status(500).send({
          message: "Something went wrong acquiring a Firebase token.",
          error: error,
        });
        console.log("Error creating custom token:", error);
      });
  }
);

const createTestUser = functions.https.onRequest((request, response) => {
  auth
    .createUser({
      email: "user@example.com",
      emailVerified: false,
      phoneNumber: "+11234567890",
      password: "secretPassword",
      displayName: "John Doe",
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false,
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
    });
});
