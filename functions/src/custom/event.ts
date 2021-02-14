import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { send_dynamic_template, sendgrid_email } from "../mail/sendgrid";
import { get_auth_token, add_callback } from "../admin/auth0";

export interface EventDoc {
  name: string;
  path_name: string;
  date: string;
}

const event_collection = "event";

export const create_event = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  const typeform_results = document.data;
  let first_name = "";
  let last_name = "";
  let email = "";
  let name = "";
  let path_name = "";
  let date = "";

  const first_name_question = "first_name";
  const last_name_question = "last_name";
  const email_question = "email";
  const name_question = "Name of Event";
  const path_name_question = "path";
  const date_question = "date";

  typeform_results.forEach((element: any) => {
    if (element.question.includes(first_name_question)) first_name = element.answer;
    if (element.question.includes(last_name_question)) last_name = element.answer;
    if (element.question.includes(email_question)) email = element.answer;
    if (element.question.includes(name_question)) name = element.answer;
    if (element.question.includes(path_name_question)) path_name = element.answer;
    if (element.question.includes(date_question)) date = new Date(element.answer).toDateString();
  });

  const email_options: sendgrid_email = {
    from: "development@acmutd.co",
    from_name: "ACM Development",
    template_id: "d-8d16910adcae4b918ba9c44670d963ac",
    to: email,
    dynamicSubstitutions: {
      first_name: first_name,
      last_name: last_name,
      name: name,
      checkin_link: `https://app.acmutd.co/checkin/${path_name}`,
      date: date,
      preheader: "Successful Event Check-in Creation Connection",
      subject: "Event Creation Confirmation",
    },
  };

  const data: EventDoc = {
    name: name,
    path_name: path_name,
    date: date,
  };

  create_map(data);
  add_callback(`https://app.acmutd.co/checkin/${path_name}`, await get_auth_token());
  send_dynamic_template(email_options);
};

const create_map = (document: EventDoc): void => {
  firestore
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
