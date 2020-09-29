import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import * as axios from "axios";
//import sendgrid from "@sendgrid/mail";
import { firestore } from "../admin/admin";

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
        const email_question = "Which email address shall we use?";
        const discord_question =
          "This event will be hosted on the ACM Discord. To give you access to the Hacktoberfest channels, we will need your discord username.";
        const first_name_question = "What's your first name?";
        const last_name_question = "What's your last name?";
        if (element.question == "email") {
          email = element.answer;
        }
        if (element.question == "discord") {
          discord_username = element.answer;
        }
        if (element.question == "first") {
          first_name = element.answer;
        }
        if (element.question.includes(last_name_question)) {
          last_name = element.answer;
        }
      });

      const discord_snowflake = (
        await axios.default.post("http://35.226.240.23:1337/mapdiscord", {
          username: discord_username,
        })
      ).data;
      const full_name = first_name + " " + last_name;

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("discord_to_email");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [discord_username]: email,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("email_to_discord");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [email]: discord_username,
            };
            //mapping.set(email, discord_username);
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("email_to_snowflake");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [email]: discord_snowflake,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("snowflake_to_email");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [discord_snowflake]: email,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("email_to_name");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [email]: full_name,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("name_to_email");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [full_name]: email,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("name_to_snowflake");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [full_name]: discord_snowflake,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );

      firestore.runTransaction(
        (t): Promise<void> => {
          const docRef = firestore.collection("discord_email").doc("snowflake_to_name");
          return t.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw "Document does not exist!";
            }
            const data = doc.data();
            const mapping = data?.mapping;
            const final = {
              ...mapping,
              [discord_snowflake]: full_name,
            };
            t.update(docRef, { mapping: final });
          });
        }
      );
    }
  } catch (error) {
    Sentry.captureException(error);
  }
});

export const send_confirmation = functions.firestore.document("typeform/{document_name}").onCreate((snap, context) => {
  console.log("Add single send code in here");
});

const runTransaction = (document_name: string, key: string, value: string) => {
  firestore.runTransaction(
    (t): Promise<void> => {
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
