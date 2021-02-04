/**
 * Handle express routing in this file
 */
import app_portal from "./express_configs/express_portal";
import app_cf from "./express_configs/express_cf";
import app_open from "./express_configs/express_open";

import { Request, Response } from "express";

import * as functions from "firebase-functions";
import * as challengeFunctions from "./challenge/challenge";
import * as hacktoberfestFunctions from "./custom/hacktoberfest";
import * as typeformFunctions from "./application/typeform";
import * as errorFunctions from "./services/ErrorService";
import * as portalFunctions from "./application/portal";
import logger, { debug_logger } from "./services/logging";
import * as Sentry from "@sentry/node";

//this will match every call made to this api.
app_portal.all("/", (request: Request, response: Response, next) => {
  logger.log(request);
  //next() basically says to run the next route that matches the url
  next();
});
app_cf.all("/", (request: Request, response: Response, next) => {
  logger.log(request);
  next();
});
app_open.all("/", (request: Request, response: Response, next) => {
  next();
});

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
app_open.get("/debug-sentry", errorFunctions.debug_sentry);
app_open.get("/debug-logger", debug_logger);

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

//all initialization requests on portal frontend for forms are get requests
app_portal.get("/auth0/create-blank-profile", portalFunctions.create_blank_profile);
app_portal.get("/auth0/profile", portalFunctions.get_profile);
app_portal.get("/auth0/developer", portalFunctions.get_developer_profile);
app_portal.get("/auth0/checkin", portalFunctions.record_event);

// Automatically send uncaught exception errors to Sentry
process.on("uncaughtException", (err) => Sentry.captureException(err));

// http server endpoints
export const cf = functions.https.onRequest(app_cf);
export const portal = functions.https.onRequest(app_portal);
export const challenge = functions.https.onRequest(app_open);

// firestore triggers
export const custom_form_actions = typeformFunctions.custom_form_actions;
export const email_discord_mapper = hacktoberfestFunctions.mapper;
export const create_profile = portalFunctions.create_profile;
export const typeform_confirmation = typeformFunctions.send_confirmation;
