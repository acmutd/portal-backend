import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import RequestOptions from "@sendgrid/helpers/classes/request";
import client from "@sendgrid/client";
import { firestore } from "../admin/admin";

type quill_profile = {
  adult: boolean;
  name: string;
  school: string;
  graduationYear: string;
  gender: string;
  description: string;
  essay: string;
};

type quill_confirmation = {
  dietaryRestrictions: string[];
};

type quill_status = {
  completedProfile: boolean;
  admitted: boolean;
  confirmed: boolean;
  declined: boolean;
  checkedIn: boolean;
  reimbursementGiven: boolean;
  admittedBy: string;
  confirmBy: number;
};

interface quill {
  _id: Record<string, unknown>;
  profile: quill_profile;
  confirmation: quill_confirmation;
  status: quill_status;
  admin: boolean;
  timestamp: number;
  lastUpdated: number;
  verified: boolean;
  salt: string;
  email: string;
  password: string;
  __v: number;
  teamCode: string;
}

const collectionName = "hackutd";

export const mongo_integration = async (request: any, response: any): Promise<void> => {
  const data: quill = request.body;
  try {
    firestore.collection(collectionName).doc(data.email).set(data);
  } catch (error) {
    Sentry.captureException(error);
  }
};

/**
 * Add person to the hacktoberfest mailing list
 */
export const uploadToSendgrid = functions.firestore
  .document("hackutd/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    client.setApiKey(functions.config().sendgrid.apikey);
    const req: RequestOptions = {
      method: "PUT",
      url: "/v3/marketing/contacts",
      body: {
        list_ids: ["32aa0cfd-03c1-4b40-919d-4dc403291cb2"],
        contacts: [
          {
            email: document.email,
            first_name: document.profile.name,
            //   first_name: first_name,
            //   last_name: last_name,
            //   custom_fields: {
            //     w3_T: discord_username,
            //     w4_T: discord_snowflake,
            //   },
          },
        ],
      },
    };
    client.request(req);
    // .then(() => {
    //   console.log("yay it worked");
    // })
    // .catch((err) => {
    //   console.log("you broke it!", err?.response?.body);
    // });
  });
