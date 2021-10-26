import { Response, Request } from "express";
import * as Sentry from "@sentry/node";
import { firestore } from "../admin/admin";
import { send_dynamic_template, upsert_contact } from "../mail/sendgrid";
import admin from "firebase-admin";
import logger from "../services/logging";
import { environment } from "../environment";
import { build_vanity_link_v2, VanityReqBody } from "../custom/vanity";
import { BadRequestError } from "../utilities/errors/BadRequestError";

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

export const create_blank_profile = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  try {
    firestore.collection(profile_collection).doc(data.sub).set(
      {
        email: data.email,
        sub: data.sub,
      },
      { merge: true }
    );
    logger.log({
      ...data,
      message: "Successfully created blank profile",
    });
    response.json({
      email: data.email,
      sub: data.sub,
    });
  } catch (err) {
    Sentry.captureException(err);
    response.json({
      message: "Failed to create a blank profile",
      error: err,
    });
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

export const create_profile_fast = async (document: FirebaseFirestore.DocumentData): Promise<void> => {
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

export const get_profile = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  try {
    const result = await firestore.collection(profile_collection).doc(data.sub).get();
    if (result.exists) {
      const fields = result.data() as Record<string, unknown>;
      if ("first_name" in fields) {
        response.json({
          ...result.data(),
          exists: true,
        });
        logger.log({
          ...result.data(),
          message: "Profile retrieval successful",
        });
        return;
      }
    }
    logger.log({
      message: "Profile not found",
      sub: data.sub,
    });
    response.json({
      exists: false,
    });
  } catch (err) {
    Sentry.captureException(err);
    response.json({
      message: "Unsuccessful execution of fetch profile",
      error: err,
      exists: false,
    });
  }
};

export const get_developer_profile = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  try {
    const result = await firestore.collection(profile_collection).doc(data.sub).get();
    const fields = result.data();
    if (result.exists) {
      response.json({
        unique_sub: data.sub,
        email: fields?.email,
        first_name: fields?.first_name,
        last_name: fields?.last_name,
        major: fields?.major,
        classification: fields?.classification,
        net_id: fields?.net_id,
      });
      logger.log({
        ...result.data(),
        message: "Profile retrieval successful",
      });
      return;
    }
    logger.log({
      message: "Profile not found",
      sub: data.sub,
    });
    response.json({
      exists: false,
    });
  } catch (err) {
    Sentry.captureException(err);
    response.json({
      message: "Unsuccessful execution of fetch developer profile",
      error: err,
      exists: false,
    });
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
