import { firestore } from "../admin/admin";
import { Response, Request } from "express";
import * as Sentry from "@sentry/node";

const collectionName = "event";

type stats = {
  likes: string[];
  rsvp: string[];
  showedUp: number;
  stayed: number;
};

type dates = {
  startTime: string; //Date; //admin.firestore.Timestamp;
  endTime: string; //Date;
};

type address = {
  fullAddress: string;
  fullStreet: string;
  streetNum: string;
  street: string;
  city: string;
  state: string;
  country: string;
};

type location = {
  geo: Geolocation; //admin.firestore.GeoPoint
  address: address;
};

interface event {
  title: string;
  description: string;
  instructions: string[];
  host: number;
  active: boolean;
  dates: dates;
  tags: string[];
  category: string[];
  online: boolean;
  stats: stats;
  location: location;
}

export const createEvent = async (request: Request, response: Response): Promise<void> => {
  const data: event = request.body;
  try {
    // if (!validateData(data)) {
    //   throw new Error(`event ${request.params.event} has invalid data format`);
    // }
    const result = await firestore.collection(collectionName).doc(request.params.event).set(data);
    response.json({
      message: "Successful execution of createEvent",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of createEvent",
      error: error?.message,
    });
  }
};

export const getEvent = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = await firestore.collection(collectionName).doc(request.params.event).get();
    response.json({
      message: "Successful execution of getEvent",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of getEvent",
      error: error,
    });
  }
};

export const deleteEvent = async (request: Request, response: Response): Promise<void> => {
  try {
    const result = await firestore.collection(collectionName).doc(request.params.event).delete();
    response.json({
      message: "Successful execution of deleteEvent",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of deleteEvent",
      error: error,
    });
  }
};

export const updateEvent = async (request: Request, response: Response): Promise<void> => {
  const data: event = request.body;
  try {
    // if (!validateData(data)) {
    //   throw new Error(`event ${request.params.event} has invalid data format`);
    // }
    const result = await firestore.collection(collectionName).doc(request.params.event).update(data);
    response.json({
      message: "Successful execution of updateEvent",
      result: result,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.json({
      message: "Unsuccessful execution of updateEvent",
      error: error,
    });
  }
};

/**
 * Needs to be tested
 * @param event
 */
function validateData(event: event) {
  if (event.title !== undefined && !(typeof event.title == "string")) return false;
  if (event.description !== undefined && !(typeof event.description == "string")) return false;
  if (event.host !== undefined && !(typeof event.host == "number")) return false;
  if (event.active !== undefined && !(typeof event.active == "boolean")) return false;
  for (let i = 0; i < event.instructions.length; i++) {
    if (event.instructions[i] !== undefined && !(typeof event.instructions[i] == "string")) return false;
  }
  for (let i = 0; i < event.tags.length; i++) {
    if (event.tags[i] !== undefined && !(typeof event.tags[i] == "string")) return false;
  }
  for (let i = 0; i < event.category.length; i++) {
    if (event.category[i] !== undefined && !(typeof event.category[i] == "string")) return false;
  }
  event.stats.likes.map((item) => {
    if (typeof item == "string") return false;
  });

  return true;
}
