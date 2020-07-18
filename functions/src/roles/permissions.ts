import { firestore } from "../admin/admin";
import admin from "firebase-admin";
import { Response, Request } from "express";

interface permissionData {
  documentName: string;
  permission: string;
}

/**
 * Add a single new permission to a role
 * @param request
 * @param response
 */
const addPermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = JSON.parse(request.body);

  try {
    const result = await firestore
      .collection("roles")
      .doc(data.documentName)
      .update({
        //   arrayUnion will add element to an array
        permissions: admin.firestore.FieldValue.arrayUnion(data.permission),
      });
    response.json(result);
  } catch (error) {
    response.status(500).json(error);
  }
};

/**
 * Remove a single permission from a role
 * @param request
 * @param response
 */
const removePermission = async (request: Request, response: Response): Promise<void> => {
  const data: permissionData = JSON.parse(request.body);

  try {
    const result = await firestore
      .collection("roles")
      .doc(data.documentName)
      .update({
        //   arrayRemove will remove element from an array
        permissions: admin.firestore.FieldValue.arrayRemove(data.permission),
      });
    response.json(result);
  } catch (error) {
    response.status(500).json(error);
  }
};

export { addPermission, removePermission };
