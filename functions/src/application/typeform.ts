import * as Sentry from "@sentry/node";
import * as functions from "firebase-functions";
import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { upsert_contact, send_dynamic_template, user_contact, sendgrid_email } from "../mail/sendgrid";
import admin from "firebase-admin";
import { build_vanity_link } from "../custom/vanity";
import { connect_sendgrid } from "../custom/sendgrid_map";
import { create_event } from "../custom/event";
// import crypto from "crypto";

const profile_collection = "profile";
const typeform_meta_collection = "typeform_meta";

type definition = {
  id: string;
  title: string;
  fields: any;
};

type form_response = {
  form_id: string;
  token: string;
  landed_at: string;
  submitted_at: string;
  definition: definition;
  hidden: any;
  answers: any; //im lazy, someone plz do this
};
interface typeform {
  event_id: string;
  event_type: string;
  form_response: form_response;
}
export interface qa {
  question: string;
  answer: string;
  type: string;
}

export const typeform_webhook = async (request: any, response: any): Promise<void> => {
  const data: typeform = request.body;
  //if (!verify_signature(request.header("Typeform-Signature"), request.body)) {
  // response.json({
  //   message: "Unauthorized",
  //   act: actualSig,
  //   exp: request.header("Typeform-Signature"),
  // });
  //}

  const qa_responses: qa[] = [];
  const questions = data.form_response.definition.fields;
  const answers = data.form_response.answers;
  const hidden = data.form_response.hidden;

  for (const [key, value] of Object.entries(hidden || {})) {
    // do not save fields that expose security vulnerabilities
    // never pass in a jwt via typeform to acm-core
    if (key === "jwt") {
      continue;
    }
    const qa_res = {
      question: key as string,
      answer: value as string,
      type: "hidden_field",
    };
    qa_responses.push(qa_res);
  }

  questions.forEach((element: any, index: number) => {
    const qa_res = {
      question: element.title,
      answer: Object.values(answers[index])[1] as string,
      type: element.type,
    };
    qa_responses.push(qa_res);
  });

  try {
    firestore.collection("typeform").add({
      typeform_id: data.form_response.definition.title,
      submission_time: data.form_response.submitted_at,
      data: qa_responses,
    });
    response.json({
      message: "Successful execution of typeform_webhook",
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of typeform_webhook",
      error: error,
    });
  }
};

export const send_confirmation = functions.firestore
  .document("typeform/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    try {
      const meta_doc = await firestore.collection(typeform_meta_collection).doc(document.typeform_id).get();
      if (!meta_doc.exists) {
        logger.log(`No email template found for typeform ${document.typeform_id}`);
        return;
      }
      const metadata = meta_doc.data();
      const typeform_results = document.data;

      let email = "";
      let first_name = "";
      let last_name = "";
      let sub = "";
      typeform_results.forEach((element: any) => {
        const email_question = "email";
        const first_name_questions = ["first name", "first_name"];
        const last_name_questions = ["last name", "last_name"];
        const sub_question = "sub";
        if (element.question.includes(email_question)) {
          email = element.answer;
        }
        if (element.question.includes(first_name_questions[0]) || element.question.includes(first_name_questions[1])) {
          first_name = element.answer;
        }
        if (element.question.includes(last_name_questions[0]) || element.question.includes(last_name_questions[1])) {
          last_name = element.answer;
        }
        if (element.question.includes(sub_question)) {
          sub = element.answer;
        }
      });
      const email_data: sendgrid_email = {
        to: email,
        from: metadata?.from,
        from_name: metadata?.from_name,
        template_id: metadata?.sendgrid_dynamic_template,
        dynamicSubstitutions: {
          first_name: first_name,
          last_name: last_name,
        },
      };
      const contact_data: user_contact = {
        email: email,
        first_name: first_name,
        last_name: last_name,
        list: metadata?.sendgrid_marketing_list,
      };
      send_dynamic_template(email_data);
      upsert_contact(contact_data);

      logger.log(
        `sending email to user ${sub} with email ${email} in response to completion of form ${document.typeform_id}`
      );
      await firestore
        .collection(profile_collection)
        .doc(sub)
        .update({
          past_applications: admin.firestore.FieldValue.arrayUnion({
            name: document.typeform_id,
            submitted_at: document.submission_time,
          }),
        });
      await firestore
        .collection(typeform_meta_collection)
        .doc(document.typeform_id)
        .update({
          submitted: admin.firestore.FieldValue.arrayUnion({
            sub: sub,
            email: email,
          }),
        });
    } catch (error) {
      Sentry.captureException(error);
    }
  });

export const custom_form_actions = functions.firestore
  .document("typeform/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    try {
      switch (document.typeform_id) {
        case "Link Generator":
          build_vanity_link(document);
          break;
        case "Connect Sendgrid":
          connect_sendgrid(document);
          break;
        case "Event Generator":
          create_event(document);
          break;
        default:
          logger.log(`No custom action found for typeform ${document.typeform_id}... exiting`);
          return;
      }
    } catch (error) {
      console.log(error);
      logger.log({
        ...error,
        message: "Error occured in custom typeform function",
      });
      Sentry.captureException(error);
    }
  });

// const verify_signature = (expectedSig: any, body: any) => {
//   const hash = crypto
//     .createHmac("sha256", functions.config().typeform.secret)
//     .update(JSON.stringify(body))
//     .digest("base64");
//   const actualSig = `sha256=${hash}`;
//   console.log("expected: " + expectedSig);
//   console.log("actual: " + actualSig);
//   if (actualSig !== expectedSig) {
//     return false;
//   }
//   return true;
// };
