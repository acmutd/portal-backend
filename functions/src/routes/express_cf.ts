/**
 * Handle express routing in this file
 */
import app_cf from "../express_configs/express_cf";
import { Request, Response } from "express";
import * as portalFunctions from "../application/portal";

app_cf.all("/", (request: Request, response: Response, next: () => void) => {
  next();
});

/**
 * Cloudflare access protected endpoint
 */
app_cf.get("/verify", portalFunctions.verify); //to be phased out
app_cf.get("/verify-jwt", portalFunctions.verify_jwt);

// http server endpoints
export default app_cf;
