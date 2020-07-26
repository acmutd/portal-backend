import { firestore } from "../admin/admin";
import admin from "firebase-admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
interface permissionData {
  permission: string;
}

const collectionName = "roles";

/**
 * Add a single new permission to a role
 * @param request
 * @param response
 */
export const addPermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = request.body;

  try {
    const result = await firestore
      .collection(collectionName)
      .doc(request.params.role)
      .update({
        //   arrayUnion will add element to an array
        permissions: admin.firestore.FieldValue.arrayUnion(data.permission),
      });
    response.json({
      message: "Successful execution of addPermission",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of addPermission",
      error: error,
    });
  }
};

/**
 * Remove a single permission from a role
 * @param request
 * @param response
 */
export const removePermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = request.body;

  try {
    const result = await firestore
      .collection(collectionName)
      .doc(request.params.role)
      .update({
        //   arrayRemove will remove element from an array
        permissions: admin.firestore.FieldValue.arrayRemove(data.permission),
      });
    response.json({
      message: "Successful execution of removePermission",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of removePermission",
      error: error,
    });
  }
};
