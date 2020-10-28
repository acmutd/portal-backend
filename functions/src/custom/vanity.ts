import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import request from "request";
import sendgrid from "@sendgrid/mail";

interface Vanity {
  destination: string;
  primary_domain: string;
  subdomain: string;
  slashtag: string;
}

/**
 * @deprecated limited functionality
 */
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

export const build_vanity_link = functions.firestore
  .document("typeform/{document_name}")
  .onCreate(async (snap, context) => {
    const document = snap.data();
    try {
      if (document.typeform_id == "Link Generator") {
        const typeform_results = document.data;
        let full_name = "";
        let email = "";
        let destination = "";
        let primary_domain = "";
        let subdomain = "";
        let slashtag = "";

        typeform_results.forEach((element: any) => {
          const fullname_question = "full name";
          const email_question = "email";
          const destination_question = "vanity link";
          const primary_domain_question = "primary domain";
          const subdomain_question = "vanity domain";
          const slashtag_question = "slashtag";
          if (element.question.includes(fullname_question)) {
            full_name = element.answer;
          }
          if (element.question.includes(email_question)) {
            email = element.answer;
          }
          if (element.question.includes(destination_question)) {
            destination = element.answer;
          }
          if (element.question.includes(primary_domain_question)) {
            primary_domain = element.answer.label;
          }
          if (element.question.includes(subdomain_question) && element.answer.label !== "") {
            subdomain = element.answer.label;
          }
          if (element.question.includes(slashtag_question)) {
            slashtag = element.answer;
          }
        });

        const data: Vanity = {
          destination: destination,
          primary_domain: primary_domain,
          subdomain: subdomain,
          slashtag: slashtag,
        };
        create_link(data);
        send_confirmation(data, email, full_name);
        console.log(full_name, email);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  });

const create_link = async (vanity: Vanity): Promise<void> => {
  const linkRequest = {
    destination: vanity.destination,
    domain: { fullName: vanity.subdomain + "." + vanity.primary_domain },
    slashtag: vanity.slashtag,
  };

  let apikey = "";
  if (vanity.primary_domain === "acmutd.co") {
    apikey = functions.config().rebrandly.apikey;
  } else {
    apikey = functions.config().rebrandly.apikey2;
  }

  const requestHeaders = {
    "Content-Type": "application/json",
    apikey: apikey,
  };

  request({
    uri: "https://api.rebrandly.com/v1/links",
    method: "POST",
    body: JSON.stringify(linkRequest),
    headers: requestHeaders,
  });
};

const send_confirmation = (vanity: Vanity, email: string, name: string) => {
  sendgrid.setApiKey(functions.config().sendgrid.apikey);
  const msg: sendgrid.MailDataRequired = {
    from: "development@acmutd.co",
    to: email,
    dynamicTemplateData: {
      preheader: "Successful Generation of Vanity Link",
      subject: "Vanity Link Confirmation",
      vanity_link: vanity.subdomain + "." + vanity.primary_domain + "/" + vanity.slashtag,
      full_name: name,
    },
    templateId: "d-cd15e958009a43b3b3a8d7352ee12c79",
  };
  sendgrid.send(msg);
};
