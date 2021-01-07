import { Response, Request } from "express";

export const verify = (request: Request, response: Response): void => {
  response.json({
    email: request.user.email,
    name: "harsha srikara",
    // jwt: request.user,
    // body: request.body,
  });
};

export const verify_idp = (request: Request, response: Response): void => {
  response.json({
    idp: request.body.idp,
  });
};
