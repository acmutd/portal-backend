import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { BadRequestError } from "../utilities/errors/BadRequestError";

/**
 *
 * Interface representing object containing parameters used by requireField
 *
 * @param fieldName - name of field that needs to be enforced as required
 * @param onErrorMsg - if this field is not included, an error object will be returned including the message stored in this variable
 *
 */
interface RequireFieldParams {
  fieldName: string;
  onErrorMsg: string;
}

/**
 *
 * Function to enforce a required field in request body
 *
 * Parameter documentation can be found above
 *
 * @return - a middleware function that will be used by express-validator to check whether given field is included in request body
 *
 */
export const requireField = ({ fieldName, onErrorMsg }: RequireFieldParams) => {
  return body(fieldName).not().isEmpty().withMessage(onErrorMsg);
};

/**
 *
 * Middleware function to validate result upon validating request body using express-validator
 *
 * @param onErrorMsg - Upon validation failure, response will return an object with the message stored in this variable
 *
 * @return - a middleware function that will return 400 response if validation fails
 *
 */
export const validateRequest = ({ onErrorMsg }: { onErrorMsg: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errObj = new BadRequestError(
        onErrorMsg,
        errors.array().map((error) => ({
          msg: error.msg,
          location: error.location,
          param: error.param,
        }))
      );
      Sentry.captureException(errObj);
      return res.status(errObj.statusCode).json(errObj.serialize());
    }
    return next();
  };
};
