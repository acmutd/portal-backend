import { firestore } from "../admin/admin";
import { Response, Request } from "express";

/**
 * Previous
 * Data object = ['docName string', 'permission string']
 */
interface roleData {
  documentName: string;
  permission?: string[];
}

/**
 * Create a new role document
 * @param request
 * @param response
 */
const createRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);
  const permissions = data.permission || []; //permissions from front-end else empty array
  try {
    const result = await firestore.collection("roles").doc(data.documentName).set({
      permissions: permissions,
    });
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

/**
 * Update a role with a complete set of new permissions
 * @param request
 * @param response
 */
const updateRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);
  const permissions = data.permission;
  try {
    const result = await firestore.collection("roles").doc(data.documentName).update({
      permissions: permissions,
    });
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

/**
 * Delete a role document
 * @param request
 * @param response
 */
const deleteRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);
  try {
    const result = await firestore.collection("roles").doc(data.documentName).delete();
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

export { createRole, updateRole, deleteRole };
