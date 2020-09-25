import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import request from "request";
import sendgrid from "@sendgrid/mail";

export const create_vanity_link = functions.firestore
  .document("vanity_link/{document_name}")
  .onCreate((snap, context) => {
    const document_value = snap.data();
    try {
      const linkRequest = {
        destination: document_value.vanity_redirect,
        domain: { fullName: document_value.vanity_domain + ".acmutd.co" },
        slashtag: document_value.vanity_slash,
      };

      const requestHeaders = {
        "Content-Type": "application/json",
        apikey: functions.config().rebrandly.apikey,
      };

      request(
        {
          uri: "https://api.rebrandly.com/v1/links",
          method: "POST",
          body: JSON.stringify(linkRequest),
          headers: requestHeaders,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any, res: any, body: string) => {
          //const link = JSON.parse(body);
          sendgrid.setApiKey(functions.config().sendgrid.apikey);
          const msg: sendgrid.MailDataRequired = {
            from: "development@acmutd.co",
            to: document_value.email,
            dynamicTemplateData: {
              preheader: "Successful Generation of Vanity Link",
              subject: "Vanity Link",
              vanity_link: document_value.vanity_domain + ".acmutd.co/" + document_value.vanity_slash,
            },
            templateId: "d-cd15e958009a43b3b3a8d7352ee12c79",
          };
          sendgrid.send(msg);
        }
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  });
