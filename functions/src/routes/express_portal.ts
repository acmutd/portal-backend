/**
 * Handle express routing in this file
 */
import app_portal from "../express_configs/express_portal";
import { Request, Response } from "express";
import * as portalFunctions from "../application/portal";
import { get_active_applications } from "../custom/form";

//this will match every call made to this api.
app_portal.all("/", (request: Request, response: Response, next) => {
  //next() basically says to run the next route that matches the url
  next();
});

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
app_portal.get("/auth0/applications", get_active_applications);

// http server endpoints
export default app_portal;
