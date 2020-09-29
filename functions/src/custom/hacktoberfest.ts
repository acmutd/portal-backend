import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import sendgrid from "@sendgrid/mail";
import { firestore } from "../admin/admin";

export const mapper = functions.firestore.document("typeform/{document_name}").onCreate((snap, context) => {
  const document = snap.data();
  try {
    if (document.typeform_id == "Hacktoberfest Registration") {
      const typeform_results = document.data;
      let email = "";
      let discord_username = "";
      typeform_results.forEach((element: any) => {
        const email_question = "Which email address shall we use?";
        const discord_question =
          "This event will be hosted on the ACM Discord. To give you access to the Hacktoberfest channels, we will need your discord username.";
        if (element.question == email_question) {
          email = element.answer;
        }
        if (element.question == discord_question) {
          discord_username = element.answer;
        }
      });

      firestore
        .runTransaction(
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
        )
        .then((something) => {
          console.log("Successful execution of mapper, grant permissions now");
        });

      firestore
        .runTransaction(
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
        )
        .then((something) => {
          console.log("Successful execution of mapper, grant permissions now");
        });
    }
  } catch (error) {
    Sentry.captureException(error);
  }
});

export const send_confirmation = functions.firestore.document("typeform/{document_name}").onCreate((snap, context) => {
  console.log("Add single send code in here");
});
