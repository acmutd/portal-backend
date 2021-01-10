import * as Sentry from "@sentry/node";
import * as functions from "firebase-functions";
import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { upsert_contact, send_dynamic_template, user_contact, sendgrid_email } from "../mail/sendgrid";
// import crypto from "crypto";

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
      const meta_doc = await firestore.collection("typeform_meta").doc(document.typeform_id).get();
      if (!meta_doc.exists) {
        logger.log(`No email template found for typeform ${document.typeform_id}`);
        return;
      }
      const metadata = meta_doc.data();
      const typeform_results = document.data;

      let email = "";
      let first_name = "";
      let last_name = "";
      typeform_results.forEach((element: any) => {
        const email_question = "email";
        const first_name_question = "firstname";
        const last_name_question = "lastname";
        if (element.question.includes(email_question)) {
          email = element.answer;
        }
        if (element.question.includes(first_name_question)) {
          first_name = element.answer;
        }
        if (element.question.includes(last_name_question)) {
          last_name = element.answer;
        }
      });
      const email_data: sendgrid_email = {
        to: email,
        from: metadata?.from,
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
    } catch (error) {
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
