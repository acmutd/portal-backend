/**
 * Firebase function exports
 */
import app_portal from "./routes/express_portal";
import app_cf from "./routes/express_cf";
import app_open from "./routes/express_open";

import * as functions from "firebase-functions";
import * as typeformFunctions from "./application/typeform";
import * as portalFunctions from "./application/portal";
import * as Sentry from "@sentry/node";

// Automatically send uncaught exception errors to Sentry
process.on("uncaughtException", (err) => Sentry.captureException(err));

// http server endpoints
export const cf = functions.https.onRequest(app_cf);
export const portal = functions.https.onRequest(app_portal);
export const challenge = functions.https.onRequest(app_open);

// firestore triggers
export const custom_form_actions = typeformFunctions.custom_form_actions;
export const create_profile = portalFunctions.create_profile;
export const typeform_confirmation = typeformFunctions.send_confirmation;
