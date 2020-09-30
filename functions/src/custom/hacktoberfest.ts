import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import * as axios from "axios";
//import sendgrid from "@sendgrid/mail";
import { firestore } from "../admin/admin";

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
      const discord_snowflake = (
        await axios.default.post("http://35.226.240.23:1337/mapdiscord", {
          username: discord_username,
          name: full_name,
          email: email,
        })
      ).data.snowflake;

      runTransaction("discord_to_email", discord_username, email);
      runTransaction("email_to_discord", email, discord_username);
      runTransaction("email_to_snowflake", email, discord_snowflake);
      runTransaction("snowflake_to_email", discord_snowflake, email);
      runTransaction("email_to_name", email, full_name);
      runTransaction("name_to_email", full_name, email);
      runTransaction("name_to_snowflake", full_name, discord_snowflake);
      runTransaction("snowflake_to_name", discord_snowflake, full_name);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
});

// export const send_confirmation = functions.firestore.document("typeform/{document_name}").onCreate((snap, context) => {
//   console.log("Add single send code in here");
// });

// eventually refactor code to use this instead
const runTransaction = (document_name: string, key: string, value: string) => {
  firestore.runTransaction(
    async (t): Promise<void> => {
      const docRef = firestore.collection("discord_email").doc(document_name);
      return t.get(docRef).then((doc) => {
        if (!doc.exists) {
          throw "Document does not exist!";
        }
        const data = doc.data();
        const mapping = data?.mapping;
        const final = {
          ...mapping,
          [key]: value,
        };
        t.update(docRef, { mapping: final });
      });
    }
  );
};
