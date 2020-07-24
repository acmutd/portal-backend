import { firestore } from "../admin/admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";

/**
 * Previous
 * Data object = ['docName string', 'permission string']
 */
interface roleData {
  permission?: string[];
}

const collectionName = "roles";

/**
 * Create a new role document
 * @param request
 * @param response
 */
export const createRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);
  const permissions = data.permission || []; //permissions from front-end else empty array
  try {
    const result = await firestore.collection(collectionName).doc(request.params.role).set({
      permissions: permissions,
    });
    response.json({
      message: "Successful execution of createRole",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of createRole",
      error: error,
    });
  }
};

/**
 * Update a role with a complete set of new permissions
 * @param request
 * @param response
 */
export const updateRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = JSON.parse(request.body);
  const permissions = data.permission;
  try {
    const result = await firestore.collection(collectionName).doc(request.params.role).update({
      permissions: permissions,
    });
    response.json({
      message: "Successful execution of updateRole",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of updateRole",
      error: error,
    });
  }
};

/**
 * Delete a role document
 * @param request
 * @param response
 */
export const deleteRole = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = await firestore.collection(collectionName).doc(request.params.role).delete();
    response.json({
      message: "Successful execution of deleteRole",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of deleteRole",
      error: error,
    });
  }
};

/**
 *
 * @param request Get a role document
 * @param response
 */
export const getRole = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = await firestore.collection(collectionName).doc(request.params.role).get();
    response.json({
      message: "Successful execution of getRole",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getRole",
      error: error,
    });
  }
};
