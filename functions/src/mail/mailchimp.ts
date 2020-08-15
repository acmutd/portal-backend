import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import { Response, Request } from "express";
import md5 from "md5";

const mailchimp = require("@mailchimp/mailchimp_marketing");

const ACM_LIST_ID = "6cc9c02dca";

interface Subscriber {
    firstName: string;
    lastName: string;
    email: string;
    interests: Record<string, boolean>;
}

mailchimp.setConfig({
    apiKey: functions.config().mailchimp.apiKey,
    server: "us7",
});

export const addSubscriber = async (request: Request, response: Response): Promise<void> => {
    try {
        const body: Subscriber = request.body;
        const hash = md5(body.email.toLowerCase());
        const r = await mailchimp.lists.setListMember(ACM_LIST_ID, hash, {
            email_address: body.email,
            status_if_new: "pending",
            status: "pending",
            merge_fields: {
                FNAME: body.firstName,
                LNAME: body.lastName,
            },
            interests: body.interests,
        });
        response.status(200).json();
    } catch (error) {
        Sentry.captureException(error);
        response.status(500).json({
            message: "Unsuccessful execution of addSubscriber",
            error: error,
        });
    }
}