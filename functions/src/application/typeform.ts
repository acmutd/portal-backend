import * as Sentry from "@sentry/node";
import * as functions from "firebase-functions";
import { firestore } from "../admin/admin";
import crypto from "crypto";
import sha256, { HMAC } from "fast-sha256";

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

const Typeform_secret = "fb85c3b30119083e17160c709f780e945f3fd3c8";

export const typeform_webhook = async (request: any, response: any): Promise<void> => {
  const data: typeform = request.body;
  // console.log(data);
  const hash = crypto.createHmac("sha256", data.form_response.token).update(JSON.stringify(data)).digest("base64");
  // const h = new HMAC(convert(data.form_response.token));
  // const mac = h.update(convert(JSON.stringify(data))).digest();
  // console.log("mac: " + Utf8ArrayToStr(mac));
  const actualSig = `sha256=${hash}`;
  //if (!verify_signature(request.header("Typeform-Signature"), request.body)) {
  response.json({
    message: "Unauthorized",
    act: actualSig,
    exp: request.header("Typeform-Signature"),
  });
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

const verify_signature = (expectedSig: any, body: any) => {
  const hash = crypto
    .createHmac("sha256", "fb85c3b30119083e17160c709f780e945f3fd3c8")
    .update(JSON.stringify(body))
    .digest("base64");
  const actualSig = `sha256=${hash}`;
  console.log("expected: " + expectedSig);
  console.log("actual: " + actualSig);
  if (actualSig !== expectedSig) {
    return false;
  }
  return true;
};

const convert = (key: string) => {
  const result = [];

  for (let i = 0; i < key.length; i += 2) {
    result.push(parseInt(key.substring(i, i + 2), 16));
  }
  const arr = Uint8Array.from(result);
  console.log(arr);
  return arr;
};

const Utf8ArrayToStr = (array: any) => {
  let out, i, c;
  let char2, char3;

  out = "";
  const len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
        break;
    }
  }

  return out;
};
