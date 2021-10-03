/**
 * Handle express routing in this file
 */
import app_open from "../express_configs/express_open";

import { Request, Response } from "express";

import * as challengeFunctions from "../challenge/challenge";
import * as hacktoberfestFunctions from "../deprecated/hacktoberfest";
import * as typeformFunctions from "../application/typeform";
import * as errorFunctions from "../services/ErrorService";
import { upsertContact } from "../mail/sendgrid";
import { debug_logger } from "../services/logging";

/**
 * Match all requests
 */
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
 * Endpoint to add people to ACM's mailing list
 */
app_open.post("/add-contact", upsertContact);

export default app_open;
