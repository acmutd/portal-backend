import axios from "axios";
import sendgrid from "@sendgrid/mail";
import { logToSlack, SlackMessage } from "../services/slack";
import { environment } from "../environment";

export interface Vanity {
  destination: string;
  primary_domain: string;
  subdomain: string;
  slashtag: string;
}

export interface VanityReqBody extends Vanity {
  first_name: string;
  last_name: string;
  email: string;
}

export const buildVanityLink = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  const typeform_results = document.data;
  let first_name = "";
  let last_name = "";
  let email = "";
  let destination = "";
  let primary_domain = "";
  let subdomain = "";
  let slashtag = "";

  const first_name_question = "first_name";
  const last_name_question = "last_name";
  const email_question = "email";
  const destination_question = "vanity link";
  const primary_domain_question = "primary domain";
  const subdomain_question = "vanity domain";
  const slashtag_question = "slashtag";

  typeform_results.forEach((element: any) => {
    if (element.question.includes(first_name_question)) first_name = element.answer;
    if (element.question.includes(last_name_question)) last_name = element.answer;
    if (element.question.includes(email_question)) email = element.answer;
    if (element.question.includes(destination_question)) destination = element.answer;
    if (element.question.includes(primary_domain_question)) primary_domain = element.answer.label;
    if (element.question.includes(subdomain_question) && element.answer.label !== "") subdomain = element.answer.label;
    if (element.question.includes(slashtag_question)) slashtag = element.answer;
  });

  const data: Vanity = {
    destination: destination,
    primary_domain: primary_domain,
    subdomain: subdomain,
    slashtag: slashtag,
  };

  const message: SlackMessage = {
    form_name: "Vanity Link Generator",
    name: first_name + " " + last_name,
    email: email,
    url: `https://${subdomain}.${primary_domain}/${slashtag}`,
  };
  await create_link(data);
  await send_confirmation(data, email, first_name, last_name);
  await logToSlack(message);
};

const create_link = async (vanity: Vanity): Promise<void> => {
  const linkRequest = {
    destination: vanity.destination,
    domain: { fullName: vanity.subdomain + "." + vanity.primary_domain },
    slashtag: vanity.slashtag,
  };

  let apikey = "";
  if (vanity.primary_domain === "acmutd.co") {
    apikey = `${environment.REBRANDLY_APIKEY}`;
  } else {
    apikey = `${environment.REBRANDLY_APIKEY2}`;
  }

  const requestHeaders = {
    "Content-Type": "application/json",
    apikey: apikey,
  };

  const config = {
    headers: requestHeaders,
  };

  axios
    .get(
      `https://api.rebrandly.com/v1/links?domain.fullName=${linkRequest.domain.fullName}&slashtag=${linkRequest.slashtag}`,
      config
    )
    .then((res) => {
      //Update the vanity link if a link with this fullName and slashtag exists.
      if (Object.keys(res.data).length != 0)
        return axios({
          url: `https://api.rebrandly.com/v1/links/${res.data[0].id}`,
          method: "post",
          data: JSON.stringify(linkRequest),
          headers: requestHeaders,
        });

      //Create a new vanity link
      return axios({
        url: "https://api.rebrandly.com/v1/links",
        method: "post",
        data: JSON.stringify(linkRequest),
        headers: requestHeaders,
      });
    });
};

export const build_vanity_link_v2 = async ({
  first_name,
  last_name,
  email,
  destination,
  primary_domain,
  subdomain,
  slashtag,
}: VanityReqBody) => {
  const vanityData: Vanity = {
    destination,
    primary_domain,
    subdomain,
    slashtag,
  };

  const message: SlackMessage = {
    form_name: "Vanity Link Generator",
    name: `${first_name} ${last_name}`,
    email,
    url: `https://${subdomain}.${primary_domain}/${slashtag}`,
  };

  const vanityResponse = await create_link_v2(vanityData);
  if (vanityResponse.httpCode && vanityResponse.httpCode !== 200) {
    throw {
      response: {
        data: vanityResponse,
      },
    };
  }
  await send_confirmation(vanityData, email, first_name, last_name);
  await logToSlack(message);
};

const create_link_v2 = async (vanity: Vanity) => {
  const linkRequest = {
    destination: vanity.destination,
    domain: {
      fullName: `${vanity.subdomain}.${vanity.primary_domain}`,
    },
    slashtag: vanity.slashtag,
  };

  const apikey =
    vanity.primary_domain === environment.URL_ROOT ? environment.REBRANDLY_APIKEY : environment.REBRANDLY_APIKEY2;

  const requestHeaders = {
    "Content-Type": "application/json",
    apikey: apikey,
  };

  const config = {
    headers: requestHeaders,
  };

  // Will be used to determine whether we are trying to create a new link or update an already exist link
  const res = await axios.get(
    `https://api.rebrandly.com/v1/links?domain.fullName=${linkRequest.domain.fullName}&slashtag=${linkRequest.slashtag}`,
    config
  );

  const { data } = await axios.post(
    `${environment.REBRANDLY_URL}${Object.keys(res.data).length !== 0 ? res.data[0].id : ""}`,
    linkRequest,
    {
      headers: requestHeaders,
    }
  );
  return data;
};

const send_confirmation = (
  vanity: Vanity,
  email: string,
  first_name: string,
  last_name: string
): Promise<[any, any]> => {
  sendgrid.setApiKey(`${environment.SENDGRID_APIKEY}`);
  const msg: sendgrid.MailDataRequired = {
    from: {
      email: "development@acmutd.co",
      name: "ACM Development",
    },
    to: email,
    dynamicTemplateData: {
      preheader: "Successful Generation of Vanity Link",
      subject: "Vanity Link Confirmation",
      vanity_link: vanity.subdomain + "." + vanity.primary_domain + "/" + vanity.slashtag,
      first_name: first_name,
      last_name: last_name,
    },
    templateId: `${environment.SENDGRID_VANITY_TEMPLATE_ID}`,
  };
  return sendgrid.send(msg);
};
