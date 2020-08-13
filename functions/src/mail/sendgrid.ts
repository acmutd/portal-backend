import sendgrid from "@sendgrid/mail";
import client from "@sendgrid/client";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import * as functions from "firebase-functions";

export const sendTestEmail = async (request: Request, response: Response): Promise<void> => {
  try {
    sendgrid.setApiKey(functions.config().sendgrid.apikey);
    const msg: sendgrid.MailDataRequired = {
      from: "development@acmutd.co",
      personalizations: [
        {
          to: "harsha.srikara@acmutd.co",
          subject: "test subject for email",
          dynamicTemplateData: {
            preheader: "this is the sample preheader",
            subject: "this is the subject",
            fname: "harsha",
          },
        },
      ],
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
  client.setApiKey(functions.config().sendgrid.apikey);
  response.json({
    message: "Successful execution of sendTestEmail",
  });
};
