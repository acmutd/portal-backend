import axios from "axios";
import { environment } from "../environment";

export interface slack_message {
  form_name: string;
  name: string;
  email: string;
  url: string;
}

/**
 * Will log a message to slack with the provided template below
 * @param message the contents for the message
 * @param channel_id the default channel to send to in slack is core-feed
 */
export const log_to_slack = async (
  message: slack_message,
  channel_id: string = environment.SLACK_CORE_FEED as string
): Promise<void> => {
  const payload = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Thanks for submitting the ${message.form_name}! Your request has been processed & is now active.`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Details*",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `User: ${message.name}\nEmail: ${message.email}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Resource URL: ${message.url}`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Visit Page",
            emoji: true,
          },
          value: "click_me_123",
          url: message.url,
          action_id: "button-action",
        },
      },
    ],
  };
  await axios.post(channel_id, payload);
};
