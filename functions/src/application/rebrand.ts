import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import request from "request";
import * as functions from "firebase-functions";

//will generate links like apply.acmutd.co/education
interface links {
  slash: string; //what comes after the /
  destination: string; //link to typeform or website or something
  title: string; //name of shortened link, not actually used
}

export const generateLink = async (req: Request, response: Response): Promise<void> => {
  try {
    const data: links = req.body;
    const linkRequest = {
      destination: data.destination,
      domain: { fullName: "apply.acmutd.co" },
      slashtag: data.slash,
      title: data.title,
    };

    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: functions.config().rebrandly.apikey,
    };

    request(
      {
        uri: "https://api.rebrandly.com/v1/links",
        method: "POST",
        body: JSON.stringify(linkRequest),
        headers: requestHeaders,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any, body: string) => {
        const link = JSON.parse(body);
        console.log(link);
        response.json({
          message: "Successful execution of generateLink",
          result: link.shortUrl,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of addPermission",
      error: error,
    });
  }
};
