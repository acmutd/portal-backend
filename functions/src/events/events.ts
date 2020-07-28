/**
 * Events
    Workshop 14
        Title
        Description
        Instructions: []
        Host: uid
        Active: true
        Dates: {
	        Start: timestamp
	        End: timestamp
        }
        Tags: [],
        Category: [],
        Online: boolean
        Stats: {
            Likes: []
            Rsvp: []
            people_who_showed_up:
        people_who_stayed_till_the_end:
        }
        Location: {
            Geo: {
                Geopoint: geopoint,
                Geohash: geohash
        },
        Address: {
            fullAddress: string,
            fullStreet: string,
            streetNum: string,
            Street: string,
            City: string,
            State: string?,
            Country: String
        }
    }

 */

import { firestore } from "../admin/admin";

type stats = {
  likes: string[],
  rsvp: string[], 
  showedUp: number, 
  stayed: number
}

type dates = {  
  startTime: Date; //admin.firestore.Timestamp;
  endTime: Date;
}

type address = {
  fullAddress: string;
  fullStreet: string;
  streetNum: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip: number;
}

type location = {
  geo: Geolocation; //admin.firestore.GeoPoint
  address: address;
}

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
      const result = await firestore
        .collection("event")
        .doc(request.body.event)
        .set(data)
        .then(() => {
            response.json(data);
        });
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

export const getEvent = async (request: Request, response: Response) => {
    const data: event = request.body;
    try {
      const result = await firestore
        .collection("event")
        .doc(request.body.event)
        .get()
        .then(() => {
            response.json(data);
        });
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

export const deleteEvent = async (request: Request, response: Response) => {
    const data: event = request.body;
    try {
      const result = await firestore
        .collection("event")
        .doc(request.params.event)
        .delete()
        .then(() => {
            response.json(data);
        });
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


export const getLocation = async (request: Request, response: Response) => {
    const data: event = request.body;
    try {
      const result = await firestore
        .collection("event")
        .doc(request.body.event)
        .collection("location")
        .doc(request.params.event)
        .get()
        .then(() => {
            response.json(data);
        });
        response.json({
          message: "Successful execution of getLocation",
          result: result,
        });
    } catch (error) {
      Sentry.captureException(error);
      response.json({
        message: "Unsuccessful execution of getLocation",
        error: error,
    });
  }
};

export const updateLocation = async (request: Request, response: Response) => {
    const data: event = request.body;
    try {
      const result = await firestore
        .collection("events")
        .doc(request.event).collection("location").doc(request.event)
        .update(data)
        .then(() => {
            response.json(data);
        });
        response.json({
          message: "Successful execution of updateLocation",
          result: result,
        });
    } catch (error) {
      Sentry.captureException(error);
      response.json({
        message: "Unsuccessful execution of updateLocation",
        error: error,
    });
  }
};

export const getStats = async (request: Request, response: Response) => {
    const data: event = request.body;
    try {
      const result = await firestore
        .collection("event")
        .doc(request.params.events)
        .collection("stats")
        .doc(request.params.event)
        .get()
        .then(() => {
            response.json(data);
        });
        response.json({
          message: "Successful execution of getStats",
          result: result,
        });
    } catch (error) {
      Sentry.captureException(error);
      response.json({
        message: "Unsuccessful execution of getStats",
        error: error,
    });
  }
};

