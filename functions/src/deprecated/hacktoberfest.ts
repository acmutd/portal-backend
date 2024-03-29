import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import * as axios from "axios";
import sendgrid from "@sendgrid/mail";
import RequestOptions from "@sendgrid/helpers/classes/request";
import client from "@sendgrid/client";
import { firestore } from "../admin/admin";
import { Request, Response } from "express";
import { environment } from "../environment";

/**
 * Note: if the discord username --> snowflake returns -1 then the full transaction will fail
 */
export const mapper = functions.firestore.document("typeform/{document_name}").onCreate(async (snap, context) => {
  const document = snap.data();
  try {
    if (document.typeform_id == "Hacktoberfest Registration") {
      const typeform_results = document.data;
      let email = "";
      let discord_username = "";
      let first_name = "";
      let last_name = "";
      typeform_results.forEach((element: any) => {
        const email_question = "email address";
        const discord_question = "your discord username";
        const first_name_question = "first name";
        const last_name_question = "last name";
        if (element.question.includes(email_question)) {
          email = element.answer;
        }
        if (element.question.includes(discord_question)) {
          discord_username = element.answer;
        }
        if (element.question.includes(first_name_question)) {
          first_name = element.answer;
        }
        if (element.question.includes(last_name_question)) {
          last_name = element.answer;
        }
      });

      const full_name = first_name + " " + last_name;

      send_confirmation(email, first_name, last_name, discord_username);

      const discord_snowflake = (
        await axios.default.post("http://35.226.240.23:1337/mapdiscord", {
          username: discord_username,
          name: full_name,
          email: email,
        })
      ).data.snowflake;

      uploadToSendgrid(first_name, last_name, discord_username, discord_snowflake, email);

      runTransaction("name_to_snowflake", full_name, discord_snowflake);
      runTransaction("email_to_snowflake", email, discord_snowflake);
      runTransaction("discord_to_snowflake", discord_username, discord_snowflake);

      runTransaction("snowflake_to_name", discord_snowflake, full_name);
      runTransaction("snowflake_to_email", discord_snowflake, email);
      runTransaction("snowflake_to_discord", discord_snowflake, discord_username);

      // Note that although the other documents are automatically generated,
      // you will need to create snowflake_to_all manually.
      firestore.collection("htf_leaderboard/snowflake_to_all/mapping").doc(discord_snowflake).set(
        {
          name: full_name,
          email: email,
          discord: discord_username,
          points: 0,
        },
        { merge: true }
      );
    }
  } catch (error) {
    Sentry.captureException(error);
  }
});

const runTransaction = (document_name: string, key: string, value: any) => {
  firestore
    .collection("htf_leaderboard")
    .doc(document_name)
    .set({ [key]: value }, { merge: true });
};

/**
 * Add person to the hacktoberfest mailing list
 */
const uploadToSendgrid = async (
  first_name: string,
  last_name: string,
  discord_username: string,
  discord_snowflake: string,
  email: string
): Promise<void> => {
  client.setApiKey(`${environment.SENDGRID_APIKEY}`);
  const req: RequestOptions = {
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: ["5f4b5fc7-d6fb-454c-bba7-7a5364a3adb6"],
      contacts: [
        {
          email: email,
          first_name: first_name,
          last_name: last_name,
          custom_fields: {
            w3_T: discord_username,
            w4_T: discord_snowflake,
          },
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
};

const send_confirmation = async (
  email: string,
  first_name: string,
  last_name: string,
  discord_username: string
): Promise<void> => {
  sendgrid.setApiKey(`${environment.SENDGRID_APIKEY}`);
  const msg: sendgrid.MailDataRequired = {
    from: {
      email: "hacktoberfest@acmutd.co",
      name: "ACM Hacktoberfest Team",
    },
    to: email,
    dynamicTemplateData: {
      first_name: first_name,
      last_name: last_name,
      discord_username: discord_username,
    },
    templateId: "d-18614de920ad48b780be05f846d6a896", // hacktoberfest template
  };
  sendgrid.send(msg);
  // uncomment if sending the email breaks
  // .then(() => {
  //   console.log("yay it worked");
  // })
  // .catch((err) => {
  //   console.log("you broke it!", err?.response?.body);
  // });
};

export const retrieve_record = async (request: Request, response: Response): Promise<void> => {
  const email = request?.body.email;
  try {
    const document = (
      await firestore.collection("htf_leaderboard/snowflake_to_all/mapping").where("email", "==", email).limit(1).get()
    ).docs[0].data();
    response.json(document);
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Error occurred in retriving record",
      error: error,
    });
  }
};
