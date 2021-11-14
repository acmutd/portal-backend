/**
 * Handle express routing in this file
 */
import app_open from "../express_configs/express_open";

import { Request, Response } from "express";
import * as typeformFunctions from "../application/typeform";
import * as errorFunctions from "../services/ErrorService";
import { upsertContact, send_email } from "../mail/sendgrid";
import { debug_logger } from "../services/logging";

/**
 * Match all requests
 */
app_open.all("/", (request: Request, response: Response, next) => {
  next();
});

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
 * Endpoint to add people to ACM's mailing list
 */
app_open.post("/add-contact", upsertContact);

/**
 * Endpoint to send an email via sendgrid
 */
app_open.post("/send-email", send_email);

export default app_open;
