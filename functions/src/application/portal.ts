import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import { firestore } from "../admin/admin";
import { send_dynamic_template, upsert_contact } from "../mail/sendgrid";
import admin from "firebase-admin";
import logger from "../services/logging";
import { environment } from "../environment";
import { build_vanity_link_v2, VanityReqBody } from "../custom/vanity";
import { BadRequestError } from "../utilities/errors/BadRequestError";
import { UserModel } from "../database/users/users.model";
import { NotFoundError } from "../utilities/errors/NotFoundError";
import { ServerError } from "../utilities/errors/ServerError";
import { EventModel } from "../database/events/event.model";

const profile_collection = environment.FIRESTORE_PROFILE_COLLECTION as string;
const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;

interface CustomRequest<T> extends Request {
  body: T;
}

export const verify = (request: Request, response: Response): void => {
  response.json({
    email: request.body.email,
  });
};

export const verify_jwt = (request: Request, response: Response): void => {
  response.json({
    message: "success",
  });
};

export const create_blank_profile = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const blankProfile = await UserModel.create({
      first_name: "",
      last_name: "",
      email,
      password: "",
      providers: [],
      school_email: "",
      school_id: "",
      school: "",
      membership: false,
      membership_history: [],
      role: [],
      submitted_applications: [],
      attended_events: [],
      stickers: [],
      resume_id: "",
    });
    res.status(201).json(blankProfile);
  } catch (error) {
    console.error(error);
    throw new ServerError("Server Error", [
      {
        msg: "Server Error",
      },
    ]);
  }
};

export const recordEvent = async (req: Request, res: Response) => {
  const { userId, eventId } = req.body;
  const eventObj = await EventModel.findById(eventId);
  if (!eventObj) {
    throw new NotFoundError("404 Not Found", [
      {
        msg: "Event does not exist",
      },
    ]);
  }

  const userObj = await UserModel.findById(userId);
  if (!userObj) {
    throw new NotFoundError("404 Not Found", [
      {
        msg: "User does not exist",
      },
    ]);
  }

  try {
    await userObj.attendEvent({
      event_id: eventId,
      name: eventObj.name,
      timestamp: new Date(),
    });
    await userObj.addSticker({ sticker_id: eventObj.sticker_id });
    await eventObj.addAttended({
      user_id: userId,
      first_name: userObj.first_name,
      last_name: userObj.last_name,
      email: userObj.email,
    });
  } catch (error) {
    console.error(error);
    throw new ServerError("500 error", [
      {
        msg: "Server Error",
      },
    ]);
  }
};

export const record_event = async (request: Request, response: Response): Promise<void> => {
  const pathname = (request.query.checkpath as string).substring((request.query.checkpath as string).lastIndexOf("/"));
  const is_checkin = (request.query.checkpath as string).includes("checkin");
  const data = request.body;
  try {
    const result = await firestore
      .collection(event_collection)
      .doc(pathname as string)
      .get();

    if (!result.exists) {
      response.json({
        exists: false,
      });
      return;
    }

    const field_name = is_checkin ? "past_events" : "past_rsvps";

    firestore
      .collection(profile_collection)
      .doc(data.sub)
      .set(
        {
          email: data.email,
          sub: data.sub,
          [field_name]: admin.firestore.FieldValue.arrayUnion({
            name: result.data()?.name,
            submitted_at: result.data()?.date,
          }),
        },
        { merge: true }
      );
    const field = is_checkin ? "attendance" : "rsvp";

    firestore
      .collection(event_collection)
      .doc(pathname as string)
      .update({
        [field]: admin.firestore.FieldValue.arrayUnion({
          sub: data.sub,
          email: data.email,
        }),
      });
    logger.log({
      ...data,
      ...result.data(),
      message: "Successfully recorded event",
    });
    response.json({
      exists: true,
      event_name: result.data()?.name,
    });
  } catch (err) {
    Sentry.captureException(err);
    response.json({
      message: "Failed to record event",
      error: err,
    });
  }
};

export const createProfileFast = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
  try {
    if (document.typeform_id == "Profile") {
      const typeform_results = document.data;
      let email = "";
      let first_name = "";
      let last_name = "";
      let utd_student = "";
      let net_id = "xxx000000";
      let university = "University of Texas at Dallas";
      let classification = "";
      let major = "";
      let sub = "";
      typeform_results.forEach((element: any) => {
        const email_question = "email";
        const first_name_question = "first name";
        const last_name_question = "last name";
        const utd_student_question = "UTD student";
        const net_id_question = "netID";
        const university_question = "university";
        const classification_question = "classification";
        const major_question = "What's your major";
        const other_major_question = "selected other";
        const sub_question = "sub";
        if (element.question.includes(email_question)) {
          email = element.answer;
        }
        if (element.question.includes(first_name_question)) {
          first_name = element.answer;
        }
        if (element.question.includes(last_name_question)) {
          last_name = element.answer;
        }
        if (element.question.includes(utd_student_question)) {
          utd_student = element.answer;
        }
        if (element.question.includes(net_id_question)) {
          net_id = element.answer;
        }
        if (element.question.includes(university_question)) {
          university = element.answer;
        }
        if (element.question.includes(classification_question)) {
          classification = element.answer.label;
        }
        if (element.question.includes(major_question)) {
          major = element.answer.label;
        }
        if (element.question.includes(other_major_question)) {
          major = element.answer;
        }
        if (element.question.includes(sub_question)) {
          sub = element.answer;
        }
      });

      send_dynamic_template({
        from: "contact@acmutd.co",
        from_name: "ACM Team",
        to: email,
        template_id: "d-ecc89a45df224386a022bb4c91762529",
        dynamicSubstitutions: {
          first_name: first_name,
          last_name: last_name,
        },
      });
      upsert_contact({
        email: email,
        first_name: first_name,
        last_name: last_name,
        list: "812fb281-b20b-405a-a281-097cc56210e0",
        meta: {
          w5_T: classification,
          w6_T: major,
          w7_T: utd_student,
          w8_T: net_id,
          w9_T: sub,
          w10_T: university,
        },
      });

      firestore
        .collection(profile_collection)
        .doc(sub)
        .set(
          {
            email: email,
            first_name: first_name,
            last_name: last_name,
            utd_student: utd_student,
            net_id: net_id,
            university: university,
            classification: classification,
            major: major,
            sub: sub,
            past_applications: admin.firestore.FieldValue.arrayUnion({
              name: "Profile Updated",
              submitted_at: new Date().toISOString(),
            }),
          },
          { merge: true }
        );
      logger.log({
        message: "Successfully saved new user profile",
        email: email,
        first_name: first_name,
        last_name: last_name,
        utd_student: utd_student,
        net_id: net_id,
        university: university,
        classification: classification,
        major: major,
        sub: sub,
      });
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const get_profile = async (req: Request<any, unknown, unknown, { id: string }>, res: Response) => {
  const { id } = req.query;
  try {
    const user = await UserModel.findById(id);
    if (!user)
      throw new NotFoundError("404 Not Found", [
        {
          msg: "Profile not found",
        },
      ]);
    res.json(user);
  } catch (error) {
    console.error(error);
    throw new ServerError("Server Error", [
      {
        msg: "Server Error",
      },
    ]);
  }
};

export const create_vanity_link = async (req: CustomRequest<VanityReqBody>, res: Response) => {
  const { first_name, last_name, email, destination, primary_domain, subdomain, slashtag } = req.body;

  try {
    await build_vanity_link_v2({
      first_name,
      last_name,
      email,
      destination,
      primary_domain,
      subdomain,
      slashtag,
    });
    return res.status(201).json({
      message: "Sucessfully created Vanity link",
      url: `https://${subdomain}.${primary_domain}/${slashtag}`,
    });
  } catch (error) {
    const errObj = new BadRequestError("Failed to create Vanity link", [(error as any).response.data]);
    Sentry.captureException(errObj);
    return res.status(400).json(errObj.serialize());
  }
};
