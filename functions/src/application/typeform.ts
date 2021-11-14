/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from "@sentry/node";
import logger from "../services/logging";
import { sendDynamicTemplate, EmailTemplate, ContactTemplate, upsertContact } from "../mail/sendgrid";
import { buildVanityLink } from "../custom/vanity";
import { connectSendgrid } from "../custom/sendgrid_map";
import { addForm } from "../custom/form";
import { createEvent } from "../custom/event";
import { environment } from "../environment";
import { createProfileFast } from "./portal";
import { database } from "../services/mongo";

const profile_collection = environment.FIRESTORE_PROFILE_COLLECTION as string;

type TypeformDefinition = {
  id: string;
  title: string;
  fields: any;
};

type TypeformResponse = {
  form_id: string;
  token: string;
  landed_at: string;
  submitted_at: string;
  definition: TypeformDefinition;
  hidden: any;
  answers: any;
};
interface TypeformMeta {
  event_id: string;
  event_type: string;
  form_response: TypeformResponse;
}

export interface TypeformQA {
  question: string;
  answer: string;
  type: string;
}

export const typeform_webhook = async (request: any, response: any): Promise<void> => {
  const data: TypeformMeta = request.body;

  const typeformQAs: TypeformQA[] = [];
  const questions = data.form_response.definition.fields;
  const answers = data.form_response.answers;
  const hidden = data.form_response.hidden;

  for (const [key, value] of Object.entries(hidden || {})) {
    // do not save fields that expose security vulnerabilities
    // never pass in a jwt via typeform to acm-core
    if (key === "jwt") {
      continue;
    }
    typeformQAs.push({
      question: key as string,
      answer: value as string,
      type: "hidden_field",
    });
  }

  questions.forEach((element: any, index: number) => {
    const qa_res = {
      question: element.title,
      answer: Object.values(answers[index])[1] as string,
      type: element.type,
    };
    typeformQAs.push(qa_res);
  });

  try {
    const documentInsert = await database.collection("typeform").insertOne({
      typeform_id: data.form_response.definition.title,
      submission_time: data.form_response.submitted_at,
      data: typeformQAs,
    });
    const typeformDocument = await database.collection("typeform").findOne({ _id: documentInsert.insertedId });
    if (typeformDocument) {
      await customFormActions(typeformDocument);
      response.json({
        message: "Successful execution of typeform_webhook",
      });
    } else {
      throw new Error("typeform_webhook: typeformDocument is undefined");
    }
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of typeform_webhook",
      error: error,
    });
  }
};

export const send_confirmation = database
  .collection("typeform")
  .watch([{ $match: { operationType: "insert" } }])
  .on("change", async (data) => {
    if (data.fullDocument) {
      try {
        const document = data.fullDocument;
        const metaDoc = await database.collection("typeform_meta").findOne({ typeform_id: document.typeform_id });
        if (!metaDoc) {
          logger.log(`No email template found for typeform ${document.typeform_id}`);
          return;
        }

        const metadata = metaDoc;
        const typeform_results = document;

        let email = "";
        let firstName = "";
        let lastName = "";
        let sub = "";

        typeform_results.forEach((element: any) => {
          const emailQuestion = "email";
          const firstNameQuestions = ["first name", "first_name"];
          const lastNameQuestions = ["last name", "last_name"];
          const subQuestion = "sub";

          if (element.question.includes(emailQuestion)) {
            email = element.answer;
          }
          if (element.question.includes(firstNameQuestions[0]) || element.question.includes(firstNameQuestions[1])) {
            firstName = element.answer;
          }
          if (element.question.includes(lastNameQuestions[0]) || element.question.includes(lastNameQuestions[1])) {
            lastName = element.answer;
          }
          if (element.question.includes(subQuestion)) {
            sub = element.answer;
          }
        });

        const emailData: EmailTemplate = {
          to: email,
          from: metadata?.from,
          from_name: metadata?.from_name,
          template_id: metadata?.sendgrid_dynamic_template,
          dynamicSubstitutions: {
            first_name: firstName,
            last_name: lastName,
            typeform_id: document.typeform_id,
          },
        };

        const contactData: ContactTemplate = {
          email: email,
          first_name: firstName,
          last_name: lastName,
          list: metadata?.sendgrid_marketing_list,
        };

        sendDynamicTemplate(emailData);
        upsertContact(contactData);

        logger.log(
          `sending email to user ${sub} with email ${email} in response to completion of form ${document.typeform_id}`
        );

        const params: Record<string, unknown> = {};
        params["$push"] = {
          past_applications: {
            $each: [
              {
                name: document.typeform_id,
                submitted_at: document.submission_time,
              },
            ],
          },
        };
        await database.collection(profile_collection).findOneAndUpdate({ sub: sub }, params);

        params["$push"] = {
          submitted: {
            $each: [
              {
                sub: sub,
                email: email,
              },
            ],
          },
        };
        await database.collection("typeform_meta").findOneAndUpdate({ typeform_id: document.typeform_id }, params);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  });

export const customFormActions = async (snap: any) => {
  const document = snap.data();
  try {
    switch (document.typeform_id) {
      case "Link Generator":
        await buildVanityLink(document);
        break;
      case "Connect Sendgrid":
        await connectSendgrid(document);
        break;
      case "Event Generator":
        await createEvent(document);
        break;
      case "Typeform Adder":
        await addForm(document);
        break;
      case "Profile":
        await createProfileFast(document);
        break;
      default:
        logger.log(`No custom action found for typeform ${document.typeform_id}... exiting`);
        return;
    }
  } catch (err) {
    logger.log({
      err,
      message: "Error occured in custom typeform function",
    });
    Sentry.captureException(err);
  }
};
