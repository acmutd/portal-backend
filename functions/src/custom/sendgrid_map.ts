import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { get_dynamic_template, create_marketing_list, sendDynamicTemplate, EmailTemplate } from "../mail/sendgrid";

export interface SendgridDoc {
  typeform_name: string;
  sendgrid_dynamic_id: string;
  sendgrid_marketing_list: string;
  sender_email: string;
  sender_from: string;
  dynamic_template_name: string;
}

const typeform_meta_collection = "typeform_meta";

export const connectSendgrid = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  const typeform_results = document.data;
  let first_name = "";
  let last_name = "";
  let email = "";
  let typeform_name = "";
  let sendgrid_dynamic_id = "";
  let sender_email = "";
  let sender_from = "";

  const first_name_question = "first_name";
  const last_name_question = "last_name";
  const email_question = "email";
  const typeform_question = "Typeform";
  const sendgrid_dynamic_id_question = "Sendgrid";
  const sender_email_question = "sender e-mail";
  const sender_from_question = "sender name";

  typeform_results.forEach((element: any) => {
    if (element.question.includes(first_name_question)) first_name = element.answer;
    if (element.question.includes(last_name_question)) last_name = element.answer;
    if (element.question.includes(email_question)) email = element.answer;
    if (element.question.includes(typeform_question)) typeform_name = element.answer;
    if (element.question.includes(sendgrid_dynamic_id_question)) sendgrid_dynamic_id = element.answer;
    if (element.question.includes(sender_email_question)) sender_email = element.answer;
    if (element.question.includes(sender_from_question)) sender_from = element.answer;
  });

  const sendgrid_id = await create_marketing_list(typeform_name);
  const template_id = await get_dynamic_template(sendgrid_dynamic_id);

  const data: SendgridDoc = {
    typeform_name: typeform_name,
    sendgrid_dynamic_id: sendgrid_dynamic_id,
    sendgrid_marketing_list: sendgrid_id,
    sender_email: sender_email,
    sender_from: sender_from,
    dynamic_template_name: template_id,
  };

  const email_options: EmailTemplate = {
    from: "development@acmutd.co",
    from_name: "ACM Development",
    template_id: "d-8d16910adcae4b918ba9c44670d963ac",
    to: email,
    dynamicSubstitutions: {
      first_name: first_name,
      last_name: last_name,
      typeform_id: typeform_name,
      template_id: template_id,
      preheader: "Successful Typeform X Sendgrid Connection",
      subject: "Sendgrid Connect Confirmation",
    },
  };
  await create_map(data);
  sendDynamicTemplate(email_options);
};

export const create_map = async (document: SendgridDoc): Promise<void> => {
  firestore.collection(typeform_meta_collection).doc(document.typeform_name).set(
    {
      sendgrid_dynamic_template: document.sendgrid_dynamic_id,
      from: document.sender_email,
      from_name: document.sender_from,
      sendgrid_marketing_list: document.sendgrid_marketing_list,
      sendgrid_template_name: document.dynamic_template_name,
    },
    { merge: true }
  );
  logger.log({
    ...document,
    message: "Successfully connected Typeform with Sendgrid",
  });
};
