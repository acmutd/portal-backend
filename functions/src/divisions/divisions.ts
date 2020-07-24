import { firestore } from "../admin/admin";
import * as functions from "firebase-functions";
import { Response, Request } from "express";

/**
 * Create a new document in the collection "divisions"
 * @param request
 * @param response
 */
const createDivision = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  functions.logger.log("Hello from info. Here's an object:", data);
  try {
    const result = await firestore.collection("divisions").doc(data.documentName).set(data);
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

const updateDivision = async (request: Request, response: Response): Promise<void> => {
  const data = JSON.parse(request.body);
  try {
    const result = await firestore.collection("divisions").doc(data.documentName).update(data);
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

/**
 * Data type:
 * const data = [ 'uid' , {
      docName: "hack-utd",
      title: "Director",
    }];
 */

const addStaffMember = async (request: Request, response: Response): Promise<void> => {
  const data = JSON.parse(request.body);

  //user.sub to retrieve the uiud of specific user
  const uid = data[0];
  const body = data[1];

  //updates certain document
  firestore
    .collection("divisions")
    .doc("hack-utd")
    .update({
      //staff: admin.firestore.FieldValue.arrayUnion(data)
      ["staff." + uid]: body,
    })
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error) => {
      //failure execution
      response.json(error);
    });
};

const updateStaffMember = async (request: Request, response: Response): Promise<void> => {
  const data = JSON.parse(request.body);

  const uid = data[0];
  const body = data[1];

  //updates certain document
  firestore
    .collection("divisions")
    .doc("hack-utd")
    .update({
      //staff: admin.firestore.FieldValue.arrayUnion(data)
      ["staff." + uid]: body,
    })
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error) => {
      //failure execution
      response.send(error);
    });
};

const readDivision = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = await firestore.collection("divisions").doc().get();
    response.json(result);
  } catch (error) {
    response.json(error);
  }
};

export { createDivision, updateDivision, addStaffMember, updateStaffMember, readDivision };
