import * as axios from "axios";
import * as Sentry from "@sentry/node";
import { Request, Response } from "express";
import logger from "../services/logging";
import { discord_profile, save_discord_profile } from "./discord";
import { environment } from "../environment";

export const get_auth_token = async (): Promise<string> => {
  const result = await axios.default.post(
    `https://${environment.AUTH0_DOMAIN}/oauth/token`,
    {
      grant_type: "client_credentials",
      client_id: environment.AUTH0_API_CLIENTID as string,
      client_secret: environment.AUTH0_API_CLIENT_SECRET as string,
      audience: `https://${environment.AUTH0_DOMAIN}/api/v2/`,
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
      `https://${environment.AUTH0_DOMAIN}/api/v2/clients/${environment.AUTH0_CLIENTID}?fields=callbacks&include_fields=true`,
      {
        headers: { "content-type": "application/json", authorization: `Bearer ${access_token}` },
      }
    );
    const callbacks = result.data.callbacks;
    callbacks.push(url);
    await axios.default.patch(
      `https://${environment.AUTH0_DOMAIN}/api/v2/clients/${environment.AUTH0_CLIENTID}`,
      {
        callbacks: callbacks,
      },
      {
        headers: { "content-type": "application/json", authorization: `Bearer ${access_token}` },
      }
    );
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
  }
};

export const get_user_metadata = async (request: Request, response: Response): Promise<void> => {
  try {
    const access_token = await get_auth_token();
    const userDetailsByIdUrl = `https://${environment.AUTH0_DOMAIN}/api/v2/users/${request.body.sub}`;

    const result = await axios.default.get(userDetailsByIdUrl, {
      headers: { "content-type": "application/json", authorization: `Bearer ${access_token}` },
    });

    const data = result.data;

    let discord_auth = false;
    let profile: discord_profile | undefined = undefined;
    let discord_access_token = "";
    data.identities
      .filter((identity: any) => {
        if (identity.connection === "Discord") {
          return true;
        }
        return false;
      })
      .forEach((identity: any) => {
        if (identity.connection === "Discord") {
          discord_auth = true;
          discord_access_token = identity.access_token;
          profile = {
            snowflake: identity.profileData.discord_snowflake,
            username: identity.profileData.discord_username,
            discriminator: identity.profileData.discord_discriminator,
          };
        }
      });

    await save_discord_profile((profile as unknown) as discord_profile, request.body.sub);

    if (discord_auth) {
      response.json({
        message: "Successful OAuth 2.0 authentication via discord",
        discord_authentication: true,
        access_token: discord_access_token,
        ...(profile || {}),
      });
    } else {
      response.json({
        message: "Discord authentication not present",
        discord_authentication: false,
        ...data,
      });
    }
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
    response.json({
      error: err,
      message: "Unsuccessful retrieval of client metadata",
      discord_authentication: false,
    });
  }
};
