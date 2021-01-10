import sendgrid from "@sendgrid/mail";
import client from "@sendgrid/client";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import RequestOptions from "@sendgrid/helpers/classes/request";
import * as functions from "firebase-functions";

export interface sendgrid_email {
  from: string;
  to: string;
  template_id: string;
  dynamicSubstitutions: Record<string, unknown>; //apparently this is the correct typescript way to define any object
}

export const sendTestEmail = async (request: Request, response: Response): Promise<void> => {
  try {
    sendgrid.setApiKey(functions.config().sendgrid.apikey);
    const msg: sendgrid.MailDataRequired = {
      from: "development@acmutd.co",
      to: "harsha.srikara@acmutd.co",
      dynamicTemplateData: {
        preheader: "this is the sample preheader",
        subject: "this is the subject",
        fname: "harsha",
      },
      templateId: "d-cd15e958009a43b3b3a8d7352ee12c79",
    };
    sendgrid.send(msg);
    response.json({
      message: "Successful execution of sendTestEmail",
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of sendTestEmail",
      error: error,
    });
  }
};

export const send_email = (request: Request, response: Response): void => {
  const data = request.body;
  try {
    send_dynamic_template(data);
    response.json({
      message: "Successful execution of send email",
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of send email",
      error: error,
    });
  }
};

export const send_dynamic_template = (data: sendgrid_email): void => {
  try {
    sendgrid.setApiKey(functions.config().sendgrid.apikey);
    const msg: sendgrid.MailDataRequired = {
      from: data.from,
      to: data.to,
      dynamicTemplateData: data.dynamicSubstitutions,
      templateId: data.template_id,
    };
    sendgrid.send(msg);
  } catch (error) {
    Sentry.captureException(error);
  }
};

// //should be able to perform search for user information through either their email or uid
export interface user_contact {
  email: string;
  first_name: string;
  last_name: string;
  list: string; //name of list from sendgrid
  meta?: Record<string, unknown>;
}

export const upsertContact = async (request: Request, response: Response): Promise<void> => {
  const data: user_contact = request.body;
  try {
    await upsert_contact(data);
    response.json({
      message: "Successful execution of upsert contact",
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of upsert contact",
      error: error,
    });
  }
};

export const upsert_contact = async (user: user_contact): Promise<void> => {
  client.setApiKey(functions.config().sendgrid.apikey);
  const req: RequestOptions = {
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: [user.list],
      contacts: [
        {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          custom_fields: user.meta,
        },
      ],
    },
  };
  //const result = await client.request(req);
  await client.request(req);
};

export const sendMailingList = async (request: Request, response: Response): Promise<void> => {
  try {
    client.setApiKey(functions.config().sendgrid.apikey);
    const req: RequestOptions = {
      method: "PUT",
      url: "/v3/marketing/singlesends",
      body: {
        name: "my mailing list name",
        send_to: {
          list_ids: ["3a5d1a12-c64b-4a0c-ae20-81fed86d760c"],
        },
      },
    };
    const result = await client.request(req);
    response.json({
      message: "Successful execution of sendMailingList",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of sendMailingList",
      error: error,
    });
  }
};

export const getMailingLists = async (request: Request, response: Response): Promise<void> => {
  try {
    client.setApiKey(functions.config().sendgrid.apikey);
    const req: RequestOptions = {
      method: "GET",
      url: "/v3/marketing/lists",
    };
    const result = await client.request(req);
    response.json({
      message: "Successful execution of getMailingLists",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getMailingLists",
      error: error,
    });
  }
};
