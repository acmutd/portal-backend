/**
 * Handle express routing in this file
 */

import * as functions from "firebase-functions";
import * as authFunctions from "./auth/auth";
import app from "./express";

//this will match every call made to this api.
app.all("/", (request, response, next) => {
  // check if the user has access to relevant permissions. If not then deny access
  // this function may end up pretty complex and need to be moved into a separate file under ./auth/verifyPermissions.ts
  // an alternative simpler way is to ensure that only requests that are validated on the front-end come through
  // if there is no way to call the api through the front end then is this additional check required?
  // we will likely have a separate auth0 production client id to ensure that just cloning & running the repo will not suffice
  // eslint-disable-next-line
  if (false) {
    response.send("Unauthorized! Access Denied");
  }

  //next() basically says to run the next route that matches the url
  next();
});

app.get("/getCustomToken", authFunctions.getCustomToken);
app.post("/createTestUser", authFunctions.createTestUser);

export const api = functions.https.onRequest(app);
