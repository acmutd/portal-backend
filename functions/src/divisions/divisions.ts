import { firestore } from "../admin/admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";

const collectionName = "divisions";

// possible add member to a division by passing either their uid or their email
// for manual entry through UI its easier to use email but uid is preferable for when we automate
interface divisionData {
  uid?: string;
  email?: string;
  title?: string;
}

export const setStaffMember = async (request: Request, response: Response): Promise<void> => {
  const data: divisionData = request.body;

  try {
    let result = undefined; //initial to check if user doesn't exist later
    if (data.uid) {
      result = (await firestore.collection("users").doc(data.uid).get()).data();
    } else if (data.email) {
      result = await firestore.collection("users").where("email", "==", data.email).get();
      result = result.docs.map((document) => document.data());
      result = result[0]; // only 1 person exists with a certain verified email address
    }
    if (result === undefined) {
      throw new Error(`${data.uid || data.email} field adoes not exist for any users`);
    }
    const res = await firestore
      .collection(collectionName)
      .doc(request.params.division)
      .update({
        ["staff." + result?.uid]: {
          name: result?.firstname + " " + result?.lastname,
          title: data.title || "officer",
          linkedin: result?.linkedin,
          photolink: result?.photolink,
          email: result?.email,
        },
      });
    response.json({
      message: "Successful execution of setStaffMember",
      result: res,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of setStaffMember",
      error: error?.message,
    });
  }
};

/**
 * Return a map of all staff members
 * @param request
 * @param response
 */
export const getAllStaff = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = (await firestore.collection(collectionName).doc(request.params.division).get()).data()?.staff;
    response.json({
      message: "Successful execution of getAllStaff",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getAllStaff",
      error: error,
    });
  }
};
