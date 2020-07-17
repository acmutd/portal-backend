import { firestore } from "../admin/admin";
import admin from "firebase-admin";
import { Response, Request } from "express";

/**
 * Previous
 * Data object = ['docName string', 'permission string']
 */

interface roleData {
  documentName: string;
  permission: string;
}

const createRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);

  const docName = data.documentName;
  const permission = data.permission;
  try {
    const result = await firestore
      .collection("roles")
      .doc(docName)
      .set({
        permissions: admin.firestore.FieldValue.arrayUnion(permission),
      });
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

const updateRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);

  // updates a new document in collection "roles"
  const docName = data.documentName;
  const permission = data.permission;
  try {
    const result = await firestore
      .collection("roles")
      .doc(docName)
      .update({
        permissions: admin.firestore.FieldValue.arrayUnion(permission),
      });
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

/**
 * Data object = ['docName string', 'permission string']
 */

const deleteRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);

  // deletes a certain document
  const docName = data.documentName;
  try {
    const result = await firestore.collection("roles").doc(docName).delete();
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

export { createRole, updateRole, deleteRole };
