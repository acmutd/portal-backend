import { firestore } from "../admin/admin";
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
    await firestore.collection(profile_collection).doc(profile_id).update(profile);
  } catch (err) {
    logger.log(err);
    Sentry.captureException(err);
  }
};
