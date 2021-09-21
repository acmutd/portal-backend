import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { send_dynamic_template, sendgrid_email } from "../mail/sendgrid";
import * as Sentry from "@sentry/node";
import { log_to_slack, slack_message } from "../services/slack";
import { environment } from "../environment";

export interface EventDoc {
  name: string;
  path_name: string;
  date: string;
  public: boolean;
}

const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;

export const create_event = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  try {
    const typeform_results = document.data;
    let first_name = "";
    let last_name = "";
    let email = "";
    let name = "";
    let path_name = "";
    let date = "";
    let public_event = false;

    const first_name_question = "first_name";
    const last_name_question = "last_name";
    const email_question = "email";
    const name_question = "Name of Event";
    const path_name_question = "path";
    const date_question = "date";
    const public_event_question = "public event";

    typeform_results.forEach((element: any) => {
      if (element.question.includes(first_name_question)) first_name = element.answer;
      if (element.question.includes(last_name_question)) last_name = element.answer;
      if (element.question.includes(email_question)) email = element.answer;
      if (element.question.includes(name_question)) name = element.answer;
      if (element.question.includes(path_name_question)) path_name = element.answer;
      if (element.question.includes(date_question)) date = new Date(element.answer).toDateString();
      if (element.question.includes(public_event_question)) public_event = element.answer;
    });

    const email_options: sendgrid_email = {
      from: "development@acmutd.co",
      from_name: "ACM Development",
      template_id: `${environment.SENDGRID_EVENT_TEMPLATE_ID}`,
      to: email,
      dynamicSubstitutions: {
        first_name: first_name,
        last_name: last_name,
        name: name,
        checkin_link: `https://${environment.URL_PROD}/checkin/${path_name}`,
        date: date,
        preheader: "Successful Event Check-in Creation Connection",
        subject: "Event Creation Confirmation",
        public_event: public_event,
      },
    };

    const data: EventDoc = {
      name: name,
      path_name: path_name,
      date: date,
      public: public_event,
    };

    const message: slack_message = {
      form_name: "Event Check-in Generator",
      name: first_name + " " + last_name,
      email: email,
      url: `https://${environment.URL_PROD}/checkin/${path_name}`,
    };

    await create_map(data);
    await send_dynamic_template(email_options);
    await log_to_slack(message);
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
  }
};

const create_map = async (document: EventDoc): Promise<void> => {
  await firestore
    .collection(event_collection)
    .doc(document.path_name)
    .create({
      ...document,
      path_name: `/checkin/${document.path_name}`,
    });
  logger.log({
    ...document,
    message: "Successfully created an event check-in",
  });
};
