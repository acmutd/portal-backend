import { firestore } from "../admin/admin";
import { Response, Request } from "express";

const createDivision = async (request: Request, response: Response): Promise<void> => {
  const data = JSON.parse(request.body);
  // Add a new document in collection "divisions"
  firestore
    .collection("divisions")
    .doc(data.docName)
    .set(data)
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error) => {
      //failure execution
      response.send(error);
    });
};

const updateDivision = async (request: Request, response: Response): Promise<void> => {
  const data = JSON.parse(request.body);

  //updates certain document
  firestore
    .collection("divisions")
    .doc(data.docName)
    .update(data)
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error) => {
      //failure execution
      response.send(error);
    });
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
