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
  answers: any; //im lazy, someone plz do this, example at bottom
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

/**
 * Collection = typeform
 *     ------ Response to a typeform
 *           --------- id: Test Webhook Connection
 *           --------- [{ questionName: something, answer: something, type: email}]
 */

/**
 * {
  "event_id": "01EJS56S3J5ZYE0RNVQNWZKQNS",
  "event_type": "form_response",
  "form_response": {
    "form_id": "eVVxaFKf",
    "token": "pjq79eypbur0ypjq798zr0jbzze7fwba",
    "landed_at": "2020-09-21T20:20:26Z",
    "submitted_at": "2020-09-21T20:20:43Z",
    "definition": {
      "id": "eVVxaFKf",
      "title": "Test Webhook Connection",
      "fields": [
        {
          "id": "VIUhZWGJYwco",
          "title": "Please enter your email address",
          "type": "email",
          "ref": "5f5bc559-5bd6-4f6c-8b32-57314232fd5f",
          "properties": {}
        },
        {
          "id": "UorrqaQ6bCUn",
          "title": "...",
          "type": "date",
          "ref": "da7d3dae-f7ed-4ca6-be13-9ba43e0db0e0",
          "properties": {}
        }
      ]
    },
    "answers": [
      {
        "type": "email",
        "email": "harsha.srikara@acmutd.co",
        "field": {
          "id": "VIUhZWGJYwco",
          "type": "email",
          "ref": "5f5bc559-5bd6-4f6c-8b32-57314232fd5f"
        }
      },
      {
        "type": "date",
        "date": "2000-05-25",
        "field": {
          "id": "UorrqaQ6bCUn",
          "type": "date",
          "ref": "da7d3dae-f7ed-4ca6-be13-9ba43e0db0e0"
        }
      }
    ]
  }
}
 */
