import { firestore } from "../admin/admin";
import * as functions from "firebase-functions";
import { Request, Response } from "express";
import * as axios from "axios";
import * as Sentry from "@sentry/node";
import logger from "../services/logging";

export interface discord_profile {
  snowflake: string;
  username: string;
  discriminator: string;
}

const profile_collection = "profile";

export const save_discord_profile = async (profile: discord_profile, profile_id: string): Promise<void> => {
  try {
    await firestore.collection(profile_collection).doc(profile_id).set(profile, { merge: true });
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
  }
};

export const verify_in_acm_server = async (request: Request, response: Response): Promise<void> => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${request.body.access_token}`,
      },
    };
    const result = await axios.default.get("https://discord.com/api/users/@me/guilds", config);

    let is_present = false;
    result.data
      .filter((guild: any) => guild.id === functions.config().discord.acm_server_id)
      .forEach((guild: any) => {
        is_present = true;
      });

    if (!is_present) {
      response.json({
        is_present: false,
        is_verified: false,
      });
      return;
    }
    const config2 = {
      headers: {
        Authorization: `Bot ${functions.config().discord.bot_token}`,
      },
    };

    const result2 = await axios.default.get(
      `https://discord.com/api/guilds/${functions.config().discord.acm_server_id}/members/${request.body.snowflake}`,
      config2
    );

    let is_verified = false;
    if (result2.data.roles.includes(functions.config().discord.member_role_id)) {
      is_verified = true;
    }

    if (is_present && is_verified) {
      const success = await add_verified_role(request.body.snowflake);
      if (success) {
        firestore.collection(profile_collection).doc(request.body.sub).set({ discord_verified: true }, { merge: true });
      }
    }
    response.json({
      is_present: is_present,
      is_verified: is_verified,
    });
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
    response.json({
      err: err,
      message: "Unsuccessful verification of presence in ACM Discord Server",
    });
  }
};

const add_verified_role = async (snowflake: string): Promise<boolean> => {
  try {
    const config = {
      headers: {
        Authorization: `Bot ${functions.config().discord.bot_token}`,
      },
    };
    await axios.default.put(
      `https://discord.com/api/guilds/${functions.config().discord.acm_server_id}/members/${snowflake}/roles/${
        functions.config().discord.verified_role_id
      }`,
      null,
      config
    );
    return true;
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
    return false;
  }
};
