import { firestore } from "../admin/admin";
import admin from "firebase-admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
interface permissionData {
  documentName: string;
  permission: string;
}

const collectionName = "roles";

/**
 * Add a single new permission to a role
 * @param request
 * @param response
 */
export const addPermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = JSON.parse(request.body);

  try {
    const result = await firestore
      .collection(collectionName)
      .doc(data.documentName)
      .update({
        //   arrayUnion will add element to an array
        permissions: admin.firestore.FieldValue.arrayUnion(data.permission),
      });
    response.json(result);
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json(error);
  }
};

/**
 * Remove a single permission from a role
 * @param request
 * @param response
 */
export const removePermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = JSON.parse(request.body);

  try {
    const result = await firestore
      .collection(collectionName)
      .doc(data.documentName)
      .update({
        //   arrayRemove will remove element from an array
        permissions: admin.firestore.FieldValue.arrayRemove(data.permission),
      });
    response.json(result);
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json(error);
  }
};
