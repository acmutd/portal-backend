import { firestore } from "../admin/admin";
import logger from "../services/logging";
import { send_dynamic_template, sendgrid_email, create_marketing_list } from "../mail/sendgrid";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { Response, Request } from "express";
import { create_map, SendgridDoc } from "../custom/sendgrid_map";
import { log_to_slack, slack_message } from "../services/slack";
import { environment } from "../environment";

export interface FormDoc {
  typeform_id: string;
  typeform_name: string;
  description: string;
  endpoint: string;
  external_link: string;
}

const form_collection = "forms";

export const add_form = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  try {
    const typeform_results = document.data;
    let first_name = "";
    let last_name = "";
    let email = "";
    let typeform_name = "";
    let description = "";
    let endpoint = "";
    let external_link = "";

    const first_name_question = "first_name";
    const last_name_question = "last_name";
    const email_question = "email";
    const typeform_question = "Name of Typeform";
    const description_question = "Description";
    const endpoint_question = "Endpoint";
    const external_link_question = "additional resources";

    typeform_results.forEach((element: any) => {
      if (element.question.includes(first_name_question)) first_name = element.answer;
      if (element.question.includes(last_name_question)) last_name = element.answer;
      if (element.question.includes(email_question)) email = element.answer;
      if (element.question.includes(typeform_question)) typeform_name = element.answer;
      if (element.question.includes(description_question)) description = element.answer;
      if (element.question.includes(endpoint_question)) endpoint = element.answer;
      if (element.question.includes(external_link_question)) external_link = element.answer;
    });

    const email_options: sendgrid_email = {
      from: "development@acmutd.co",
      from_name: "ACM Development",
      template_id: `${environment.SENDGRID_FORM_TEMPLATE_ID}`,
      to: email,
      dynamicSubstitutions: {
        first_name: first_name,
        last_name: last_name,
        description: description,
        form_link: `https://${environment.URL_PROD}/forms/${endpoint}`,
        typeform_name: typeform_name,
        preheader: "Successful Form Addition to Portal",
        subject: "Form Addition Confirmation",
        external_link: external_link,
      },
    };

    const typeform_id = await get_typeform_id(typeform_name);
    await add_hidden_fields(typeform_id);
    await add_webhook(typeform_id);

    const data: FormDoc = {
      typeform_name: typeform_name,
      typeform_id: typeform_id,
      description: description,
      endpoint: endpoint,
      external_link: external_link,
    };

    const generic_email: SendgridDoc = {
      typeform_name: typeform_name,
      sendgrid_dynamic_id: "d-217be862cfaf41d4abfbede579e73e52",
      sendgrid_marketing_list: await create_marketing_list(typeform_name),
      sender_email: "contact@acmutd.co",
      sender_from: "ACM Contact",
      dynamic_template_name: "Generic Thanks Form",
    };

    const message: slack_message = {
      form_name: "Typeform Adder",
      name: first_name + " " + last_name,
      email: email,
      url: `https://${environment.URL_PROD}/forms/${endpoint}`,
    };

    await create_map(generic_email);
    await create_form_map(data);
    await send_dynamic_template(email_options);
    await log_to_slack(message);
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
  }
};

const create_form_map = async (document: FormDoc): Promise<void> => {
  await firestore.collection(form_collection).add({
    ...document,
    active: true,
    path_name: `/forms/${document.endpoint}`,
  });
  logger.log({
    ...document,
    message: "Successfully created a linked form",
  });
};

const get_typeform_id = async (typeform_name: string): Promise<string> => {
  const config = {
    headers: {
      Authorization: `Bearer ${environment.TYPEFORM_ACCESS_TOKEN}`,
    },
  };
  const query = {
    search: typeform_name,
    page_size: "1",
  };
  const result = await axios.get("https://api.typeform.com/forms?" + new URLSearchParams(query).toString(), config);
  return result.data.items[0].id;
};

const add_hidden_fields = async (typeform_id: string): Promise<void> => {
  const config = {
    headers: {
      Authorization: `Bearer ${environment.TYPEFORM_ACCESS_TOKEN}`,
    },
  };
  const typeform = await axios.get(`https://api.typeform.com/forms/${typeform_id}`, config);
  const typeform_body = {
    ...typeform.data,
    hidden: ["classification", "email", "first_name", "last_name", "major", "net_id", "unique_sub"],
  };
  const result = await axios.put(`https://api.typeform.com/forms/${typeform_id}`, typeform_body, config);
  return result.data;
};

const add_webhook = async (typeform_id: string): Promise<void> => {
  const config = {
    headers: {
      Authorization: `Bearer ${environment.TYPEFORM_ACCESS_TOKEN}`,
    },
  };
  const body = {
    url: environment.TYPEFORM_WEBHOOK_URL,
    enabled: true,
    verify_ssl: true,
    secret: environment.TYPEFORM_SECRET,
  };
  const result = await axios.put(`https://api.typeform.com/forms/${typeform_id}/webhooks/acmcore`, body, config);
  return result.data;
};

export const get_active_applications = async (request: Request, response: Response): Promise<void> => {
  try {
    const results = await firestore.collection(form_collection).where("active", "==", true).get();
    const applications = results.docs.map((doc) => doc.data());
    response.json({
      total: applications.length,
      applications: applications,
    });
    logger.log({
      message: "Successful execution of get active applications",
    });
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
    response.json({
      applications: [],
      total: 0,
      error: err,
    });
  }
};
