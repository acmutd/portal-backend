/**
 * Handle express routing in this file
 */
import app_portal from "./express_configs/express_portal";
import app_cf from "./express_configs/express_cf";
import app_secure from "./express_configs/express_secure";
import app_open from "./express_configs/express_open";

import * as functions from "firebase-functions";
import * as authFunctions from "./auth/auth";
import * as divisionFunctions from "./divisions/divisions";
import * as roleFunctions from "./roles/roles";
import * as permissionFunctions from "./roles/permissions";
import * as applicationFunctions from "./application/rebrand";
import * as challengeFunctions from "./challenge/challenge";
import * as sendgridFunctions from "./mail/sendgrid";
import * as eventFunctions from "./events/events";
import * as vanityFunctions from "./custom/vanity";
import * as hacktoberfestFunctions from "./custom/hacktoberfest";
import * as typeformFunctions from "./application/typeform";
import * as errorFunctions from "./services/ErrorService";
import * as portalFunctions from "./application/portal";

//this will match every call made to this api.
app_secure.all("/", (request, response, next) => {
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

/**
 * Sample functions, not actually used
 */
app_secure.get("/getCustomToken", authFunctions.getCustomToken);
app_secure.post("/createTestUser", authFunctions.createTestUser);

/**
 * API will error out if the role is not present.
 * For create role it will error if the role is already present
 */
app_secure.post("/role/:role", roleFunctions.createRole);
app_secure.put("/role/:role", roleFunctions.updateRole);
app_secure.delete("/role/:role", roleFunctions.deleteRole);
app_secure.get("/role/:role", roleFunctions.getRole);
app_secure.get("/role", roleFunctions.getAllRoles);

/**
 * Granular permissions management
 */
app_secure.post("/role/:role/addPermission", permissionFunctions.addPermission);
app_secure.post("/role/:role/removePermission", permissionFunctions.removePermission);

/**
 * Operate on divisions
 */
app_secure.post("/division/:division", divisionFunctions.setStaffMember);
app_secure.get("/division/:division", divisionFunctions.getAllStaff);

/**
 * Operate on events
 */
app_secure.post("/event/:event", eventFunctions.createEvent);
app_secure.put("/event/:event", eventFunctions.updateEvent);
app_secure.delete("/event/:event", eventFunctions.deleteEvent);
app_secure.get("/event/:event", eventFunctions.getEvent);

/**
 * Link shortener
 */
app_secure.post("/link", applicationFunctions.createLink);
app_secure.post("/link/:link", applicationFunctions.updateLink);
app_secure.get("/link/:link", applicationFunctions.getLink);
app_secure.delete("/link/:link", applicationFunctions.deleteLink);
app_secure.get("/link", applicationFunctions.getLinks);

/**
 * Sendgrid integration
 */
app_secure.post("/sendgrid/send", sendgridFunctions.sendTestEmail);
app_secure.post("/sendgrid/send2", sendgridFunctions.sendDynamicTemplate);
app_secure.post("/sendgrid/upsertContact", sendgridFunctions.upsertContact);
app_secure.post("/sendgrid/sendMailingList", sendgridFunctions.sendMailingList);

/**
 * Challenges for ACM Development
 */
app_open.post("/tags/:tag", challengeFunctions.createTag);
app_open.get("/tags/:tag/:token", challengeFunctions.getTag);
app_open.patch("/tags/:tag/:token", challengeFunctions.patchTag);
app_open.delete("/tags/:tag/:token", challengeFunctions.deleteTag);

/**
 * typeform webhook
 */
app_open.post("/typeform", typeformFunctions.typeform_webhook);

/**
 * Debugging endpoints
 */
app_secure.get("/debug-sentry", errorFunctions.debug_sentry);
app_open.get("/debug-sentry", errorFunctions.debug_sentry);

/**
 * htf-development retrieval
 */
app_open.post("/htf-development", hacktoberfestFunctions.retrieve_record);

/**
 * Cloudflare access protected endpoint
 */
app_cf.get("/verify", portalFunctions.verify); //to be phased out
app_cf.get("/verify-idp", portalFunctions.verify_idp);

/**
 * The two following endpoints are duplicated across both /auth0 and /gsuite
 * This is because they have common requirements
 * Additional endpoints for separate forms will be on one or the other path
 */
app_portal.get("/auth0/verify-idp", portalFunctions.verify_idp);
app_portal.get("/gsuite/verify-idp", portalFunctions.verify_idp);

app_portal.get("/auth0/verify", portalFunctions.verify);
app_portal.get("/gsuite/verify", portalFunctions.verify);

app_portal.post("/auth0/create-blank-profile", portalFunctions.create_blank_profile);

/**
 * @deprecated
 * Auth0 protected endpoint
 */
app_secure.get("/verify", (req, res) => {
  console.log(req);
  res.json({
    message: "Successful execution of jwt verification",
  });
});

// http server endpoints
export const cf = functions.https.onRequest(app_cf);
export const api = functions.https.onRequest(app_secure);
export const portal = functions.https.onRequest(app_portal);
export const challenge = functions.https.onRequest(app_open);

// firestore triggers
export const build_vanity_link = vanityFunctions.build_vanity_link;
export const create_vanity_link = vanityFunctions.create_vanity_link;
export const email_discord_mapper = hacktoberfestFunctions.mapper;
export const create_profile = portalFunctions.create_profile;
