import sendgrid from "@sendgrid/mail";
import client from "@sendgrid/client";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import RequestOptions from "@sendgrid/helpers/classes/request";
import * as functions from "firebase-functions";

interface sendSingleEmail {
  from: string;
  to: string;
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

export const sendDynamicTemplate = async (request: Request, response: Response): Promise<void> => {
  try {
    const data: sendSingleEmail = request.body;
    sendgrid.setApiKey(functions.config().sendgrid.apikey);
    const msg: sendgrid.MailDataRequired = {
      from: data.from,
      to: data.to,
      dynamicTemplateData: data.dynamicSubstitutions,
      templateId: "d-cd15e958009a43b3b3a8d7352ee12c79", //someone needs to flesh out these templates more nicely later
    };
    sendgrid.send(msg);
    response.json({
      message: "Successful execution of sendDynamicTemplate",
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of sendDynamicTemplate",
      error: error,
    });
  }
};

//should be able to perform search for user information through either their email or uid
interface userContact {
  email: string;
  uid: string;
  list: string; //name of list
}

export const upsertContact = async (request: Request, response: Response): Promise<void> => {
  try {
    client.setApiKey(functions.config().sendgrid.apikey);
    const req: RequestOptions = {
      method: "PUT",
      url: "/v3/marketing/contacts",
      body: {
        list_ids: ["3a5d1a12-c64b-4a0c-ae20-81fed86d760c"],
        contacts: [
          {
            email: "harsha.srikara@acmutd.co",
          },
        ],
      },
    };
    const result = await client.request(req);
    response.json({
      message: "Successful execution of upsertContact",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of upsertContact",
      error: error,
    });
  }
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
