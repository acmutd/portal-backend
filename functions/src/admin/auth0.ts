import * as axios from "axios";
import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import logger from "../services/logging";

export const get_auth_token = async (): Promise<string> => {
  const result = await axios.default.post(
    `https://${functions.config().auth0.domain}/oauth/token`,
    {
      grant_type: "client_credentials",
      client_id: functions.config().auth0_api.clientid,
      client_secret: functions.config().auth0_api.client_secret,
      audience: `https://${functions.config().auth0.domain}/api/v2/`,
    },
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
  return result.data.access_token;
};

export const add_callback = async (url: string, access_token: string): Promise<void> => {
  try {
    const result = await axios.default.get(
      `https://${functions.config().auth0.domain}/api/v2/clients/${
        functions.config().auth0.clientid
      }?fields=callbacks&include_fields=true`,
      {
        headers: { "content-type": "application/json", authorization: `Bearer ${access_token}` },
      }
    );
    const callbacks = result.data.callbacks;
    callbacks.push(url);
    await axios.default.patch(
      `https://${functions.config().auth0.domain}/api/v2/clients/${functions.config().auth0.clientid}`,
      {
        callbacks: callbacks,
      },
      {
        headers: { "content-type": "application/json", authorization: `Bearer ${access_token}` },
      }
    );
  } catch (err) {
    logger.log({
      ...err,
      message: "Error occurred in updating callback urls on Auth0",
    });
    Sentry.captureException(err);
  }
};
