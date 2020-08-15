/**
 * Handle express routing in this file
 */

import * as functions from "firebase-functions";
import * as authFunctions from "./auth/auth";
import * as divisionFunctions from "./divisions/divisions";
import * as roleFunctions from "./roles/roles";
import * as permissionFunctions from "./roles/permissions";
import * as applicationFunctions from "./application/rebrand";
import * as sendgridFunctions from "./mail/sendgrid";
import * as mailchimpFunctions from "./mail/mailchimp";
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

/**
 * API will error out if the role is not present.
 * For create role it will error if the role is already present
 */
app.post("/createRole/:role", roleFunctions.createRole);
app.put("/updateRole/:role", roleFunctions.updateRole);
app.delete("/deleteRole/:role", roleFunctions.deleteRole);
app.get("/getRole/:role", roleFunctions.getRole);
app.get("/getRoles", roleFunctions.getAllRoles);

/**
 * Granular permissions management
 */
app.post("/updateRole/:role/addPermission", permissionFunctions.addPermission);
app.post("/updateRole/:role/removePermission", permissionFunctions.removePermission);

/**
 * Operate on divisions
 */
app.post("/:division/setStaffMember", divisionFunctions.setStaffMember);
app.get("/:division/getAllStaff", divisionFunctions.getAllStaff);

/**
 * Link shortener & Applications
 */
app.post("/generateLink", applicationFunctions.generateLink);

/**
 * Sendgrid integration
 */
app.post("/sendgrid/send", sendgridFunctions.sendTestEmail);
app.post("/sendgrid/send2", sendgridFunctions.sendDynamicTemplate);
app.post("/sendgrid/upsertContact", sendgridFunctions.upsertContact);
app.post("/sendgrid/sendMailingList", sendgridFunctions.sendMailingList);

/**
 * Mailchimp integration
 */
app.put("/mailchimp/subscribers", mailchimpFunctions.addSubscriber);

export const api = functions.https.onRequest(app);
