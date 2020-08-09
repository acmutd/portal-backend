import sendgrid from "@sendgrid/mail";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import * as functions from "firebase-functions";

export const sendTestEmail = async (request: Request, response: Response): Promise<void> => {
  try {
    sendgrid.setApiKey(functions.config().sendgrid.apikey);
    const msg: sendgrid.MailDataRequired = {
      to: "harsha.srikara@acmutd.co",
      from: "development@acmutd.co",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
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
