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

import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import { firestore } from "./admin/admin";

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
app.post("/role/:role", roleFunctions.createRole);
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

export const api = functions.https.onRequest(app);

const app2 = express();
app2.use(cors({ origin: true }));
app2.use(bodyParser.json());
app2.use(bodyParser.urlencoded({ extended: true }));

app2.post("/tags/:tag", (request: any, response: any) => {
  const tagData = request.body;
  if (!tagData.name) {
    response.status(404).json({ message: `name missing` });
  }
  if (!tagData.contents) {
    response.status(404).json({ message: `contents missing` });
  }
  if (tagData.name !== request.params.tag) {
    response.status(403).json({ message: `body name and query param name are not identical` });
  }
  firestore
    .collection("challenge")
    .add({
      name: tagData.name,
      contents: tagData.contents,
    })
    .then((docRef) => {
      response.json({
        name: tagData.name,
        contents: tagData.contents,
        token: docRef.id,
      });
    });
});

app2.get("/tags/:tag", (request: any, response: any) => {
  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(403).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0].data();
      response.json({
        name: doc.name,
        contents: doc.contents,
      });
    });
});

app2.patch("/tags/:tag/:token", (request: any, response: any) => {
  const tagData = request.body;
  if (!tagData.contents) {
    response.status(404).json({ message: `contents missing` });
  }

  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(404).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0];
      if (doc.id !== request.params.token) {
        response.status(403).json({ message: `invalid token` });
      } else {
        firestore.collection("challenge").doc(request.params.token).update({
          contents: tagData.contents,
        });
        response.json({
          name: tagData.name,
          contents: tagData.contents,
        });
      }
    });
});

app2.delete("/tags/:tag/:token", (request: any, response: any) => {
  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(404).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0];
      if (doc.id !== request.params.token) {
        response.status(403).json({ message: `invalid token` });
      } else {
        firestore.collection("challenge").doc(request.params.token).delete();
        response.status(200).send();
      }
    });
});

export const challenge = functions.https.onRequest(app2);
