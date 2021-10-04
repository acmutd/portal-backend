import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

/**
 *
 * Function to enforce a required field in request body
 *
 * @param fieldName - name of field that needs to be enforced as required
 * @param onErrorMsg - if this field is not included, an error object will be returned including the message stored in this variable
 *
 *
 */
export const requireField = ({ fieldName, onErrorMsg }: { fieldName: string; onErrorMsg: string }) => {
  return body(fieldName).not().isEmpty().withMessage(onErrorMsg);
};

/**
 *
 * Middleware function to validate result upon validating request body using express-validator
 *
 * @param onErrorMsg - Upon validation failure, response will return an object with the message stored in this variable
 *
 *
 */
export const validateRequest = ({ onErrorMsg }: { onErrorMsg: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: onErrorMsg,
        error: errors.array().map((error) => ({
          msg: error.msg,
          location: error.location,
          param: error.param,
        })),
      });
    }
    return next();
  };
};
