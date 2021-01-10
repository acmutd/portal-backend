import { Response, Request } from "express";
import * as functions from "firebase-functions";
import Sentry from "@sentry/node";
import { firestore } from "../admin/admin";
import sendgrid from "@sendgrid/mail";
import RequestOptions from "@sendgrid/helpers/classes/request";
import client from "@sendgrid/client";

const profile_collection = "profile";

export const verify = (request: Request, response: Response): void => {
  response.json({
    email: request.user.email,
    name: request.body.parsed_name,
    // jwt: request.user,
    // body: request.body,
  });
};

export const verify_idp = (request: Request, response: Response): void => {
  response.json({
    idp: request.body.idp,
  });
};

export const create_blank_profile = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  try {
    firestore.collection(profile_collection).doc(data.sub).set(
      {
        email: request.user.email,
        sub: data.sub,
      },
      { merge: true }
    );
    response.json({
      email: request.user.email,
      sub: data.sub,
    });
  } catch (err) {
    Sentry.captureException(err);
    response.json({
      message: "Failed to create a blank profile",
      error: err,
    });
  }
};

export const create_profile = functions.firestore
  .document("typeform/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    try {
      if (document.typeform_id == "Profile") {
        const typeform_results = document.data;
        let email = "";
        let first_name = "";
        let last_name = "";
        let utd_student = "";
        let net_id = "";
        let university = "University of Texas at Dallas";
        let classification = "";
        let major = "";
        let sub = "";
        typeform_results.forEach((element: any) => {
          const email_question = "email";
          const first_name_question = "first name";
          const last_name_question = "last name";
          const utd_student_question = "UTD student";
          const net_id_question = "netID";
          const university_question = "university";
          const classification_question = "classification";
          const major_question = "What's your major";
          const other_major_question = "selected other";
          const sub_question = "sub";
          if (element.question.includes(email_question)) {
            email = element.answer;
          }
          if (element.question.includes(first_name_question)) {
            first_name = element.answer;
          }
          if (element.question.includes(last_name_question)) {
            last_name = element.answer;
          }
          if (element.question.includes(utd_student_question)) {
            utd_student = element.answer;
          }
          if (element.question.includes(net_id_question)) {
            net_id = element.answer;
          }
          if (element.question.includes(university_question)) {
            university = element.answer;
          }
          if (element.question.includes(classification_question)) {
            classification = element.answer.label;
          }
          if (element.question.includes(major_question)) {
            major = element.answer.label;
          }
          if (element.question.includes(other_major_question)) {
            major = element.answer;
          }
          if (element.question.includes(sub_question)) {
            sub = element.answer;
          }
        });
        // send a confirmation email here

        firestore.collection(profile_collection).doc(sub).set(
          {
            email: email,
            first_name: first_name,
            last_name: last_name,
            utd_student: utd_student,
            net_id: net_id,
            university: university,
            classification: classification,
            major: major,
            sub: sub,
          },
          { merge: true }
        );
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  });

export const get_profile = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  try {
    const result = await firestore.collection(profile_collection).doc(data.sub).get();
    if (result.exists) {
      response.json({
        ...result.data(),
        exists: true,
      });
    }
    response.json({
      exists: false,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const education_confirmation = functions.firestore
  .document("typeform/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    try {
      if (document.typeform_id == "2021 Spring ACM Education Officer Application") {
        const typeform_results = document.data;
        let email = "";
        let first_name = "";
        let last_name = "";
        typeform_results.forEach((element: any) => {
          const email_question = "email";
          const first_name_question = "first name";
          const last_name_question = "last name";
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
        send_confirmation(email, first_name, last_name);
        uploadToSendgrid(first_name, last_name, email);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  });

/**
 * Add person to the hacktoberfest mailing list
 */
const uploadToSendgrid = async (first_name: string, last_name: string, email: string): Promise<void> => {
  client.setApiKey(functions.config().sendgrid.apikey);
  const req: RequestOptions = {
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: ["c20a210d-d1e8-4b8c-a41c-d6c579c9aa12"],
      contacts: [
        {
          email: email,
          first_name: first_name,
          last_name: last_name,
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

const send_confirmation = async (email: string, first_name: string, last_name: string): Promise<void> => {
  sendgrid.setApiKey(functions.config().sendgrid.apikey);
  const msg: sendgrid.MailDataRequired = {
    from: {
      email: "education@acmutd.co",
      name: "ACM Education Team",
    },
    to: email,
    dynamicTemplateData: {
      first_name: first_name,
      last_name: last_name,
    },
    templateId: "d-e87f6ffae59b43abaf6e0064e50583eb", // education template
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
