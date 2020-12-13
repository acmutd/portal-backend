import * as Sentry from "@sentry/node";
import { firestore } from "../admin/admin";

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

interface qa {
  question: string;
  answer: string;
  type: string;
}

export const typeform_webhook = async (request: any, response: any): Promise<void> => {
  const data: typeform = request.body;

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
