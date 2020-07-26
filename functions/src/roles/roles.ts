import { firestore } from "../admin/admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";

/**
 * Previous
 * Data object = ['docName string', 'permission string']
 */
interface roleData {
  permissions?: string[];
}

const collectionName = "roles";

/**
 * Create a new role document
 * @param request
 * @param response
 */
export const createRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = request.body;
  const permissions = data.permissions || []; //permissions from front-end else empty array
  try {
    //extra read has negligible effect because this endpoint will not be called often
    const res = await firestore.collection(collectionName).doc(request.params.role).get();
    //check if role already exists
    if (res.exists) {
      throw new Error(`role ${request.params.role} already exists`);
    }
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
      error: error?.message,
    });
  }
};

/**
 * Update a role with a complete set of new permissions
 * @param request
 * @param response
 */
export const updateRole = async (request: Request, response: Response): Promise<void> => {
  const data: roleData = request.body;
  const permissions = data.permissions;
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
      result: result.data(),
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getRole",
      error: error,
    });
  }
};

/**
 * Return an array of all documents in the roles collection
 * @param request
 * @param response
 */
export const getAllRoles = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = (await firestore.collection(collectionName).get()).docs.map((document) => {
      return {
        id: document.id,
        ...document.data(),
      };
    });
    response.json({
      message: "Successful execution of getAllRoles",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getAllRoles",
      error: error,
    });
  }
};
