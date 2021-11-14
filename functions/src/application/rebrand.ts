import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import request from "request";
import { environment } from "../environment";

//will generate links like apply.acmutd.co/education
interface LinkData {
  slash: string; //what comes after the /
  destination: string; //link to typeform or website or something
  title: string; //name of shortened link, not actually used
  subdomain: string; //apply, survey, rsvp, content
}

export const createLink = async (req: Request, response: Response): Promise<void> => {
  try {
    const data: LinkData = req.body;
    const linkRequest = {
      destination: data.destination,
      domain: { fullName: `${data.subdomain}.acmutd.co` },
      slashtag: data.slash,
      title: data.title,
    };

    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: environment.REBRANDLY_APIKEY,
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
          result: link,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of generateLink",
      error: error,
    });
  }
};

export const updateLink = async (req: Request, response: Response): Promise<void> => {
  try {
    const data: LinkData = req.body;
    const linkRequest = {
      destination: data.destination,
      slashtag: data.slash,
      title: data.title,
    };

    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: environment.REBRANDLY_APIKEY,
    };
    request(
      {
        uri: `https://api.rebrandly.com/v1/links/${req.params.link}`,
        method: "POST",
        body: JSON.stringify(linkRequest),
        headers: requestHeaders,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any, body: string) => {
        const link = JSON.parse(body);
        console.log(link);
        response.json({
          message: "Successful execution of updateLink",
          result: link,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of updateLink",
      error: error,
    });
  }
};

export const getLink = async (req: Request, response: Response): Promise<void> => {
  try {
    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: environment.REBRANDLY_APIKEY,
    };
    request(
      {
        uri: `https://api.rebrandly.com/v1/links/${req.params.link}`,
        method: "GET",
        headers: requestHeaders,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any, body: string) => {
        const link = JSON.parse(body);
        console.log(link);
        response.json({
          message: "Successful execution of getLlink",
          result: link,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getLink",
      error: error,
    });
  }
};

export const deleteLink = async (req: Request, response: Response): Promise<void> => {
  try {
    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: environment.REBRANDLY_APIKEY,
    };
    request(
      {
        uri: `https://api.rebrandly.com/v1/links/${req.params.link}`,
        method: "DELETE",
        headers: requestHeaders,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any, body: string) => {
        const link = JSON.parse(body);
        console.log(link);
        response.json({
          message: "Successful execution of getLlink",
          result: link,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getLink",
      error: error,
    });
  }
};

export const getLinks = async (req: Request, response: Response): Promise<void> => {
  try {
    const requestHeaders = {
      "Content-Type": "application/json",
      apikey: environment.REBRANDLY_APIKEY,
    };
    request(
      {
        uri: "https://api.rebrandly.com/v1/links",
        method: "GET",
        headers: requestHeaders,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any, body: string) => {
        const link = JSON.parse(body);
        console.log(link);
        response.json({
          message: "Successful execution of getLinks",
          result: link,
        });
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getLinks",
      error: error,
    });
  }
};
