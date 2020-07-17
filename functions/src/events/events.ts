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

interface event {
    title: string;
    description: string;
    instructions: [];
    host: number;
    active: boolean;
    tags: [];
    category: [];
    online: boolean;
    stats: {"likes" : [], "rsvp" : [], "showedUp" : number, "stayed" : number};
    dates: {};
    location: {"geo" : [], "address": { "fullAddress" : string
                                        "fullStreet" : string
                                        "streetNum" : number
                                        "street" : string
                                        "city" : string
                                        "state" : string
                                        "zip" : number
                                        "country" : string
                                       }
    }
    
}

exports.createEvent = async (request: any, response: any) => {
    const data = JSON.parse(request.body);
    firestore
        .collection("events")
        .doc(data.docName)
        .set(data)
        .then(() => {
            response.json(data);
        })
        .catch((error: any) => {
            response.send("Error creating event")
    });
};

exports.getEvent = async (request: any, response: any) => {
    await firestore
      .collection("events")
      .doc(request.params.event)
      .get()
      .then((data) => {
        response.json(data);
      })
      .catch((error: any) => {
        response.send("Event not found");
    });
};

exports.deleteEvent = async (request: any, response: any) => {
    await firestore
      .collection("events")
      .doc(request.params.events)
      .delete()
      .then(() => {
        response.json("Event deleted");
      })
      .catch((error: any) => {
        response.send("Error deleting event");
    });
};


exports.getLocation = async (request: any, response: any) => {
    await firestore
      .collection("event")
      .doc(request.params.event)
      .collection("location")
      .doc(request.params.event)
      .get()
      .then(() => {
        response.json("Event location retrieved"); 
      })
      .catch((error: any) => {
        response.send("Error getting event location");
    });
};

exports.updateLocation = async (request: any, response: any) => {
    const data = JSON.parse(request.body);
    await firestore
      .collection("event")
      .doc(request.location)
      .update(data)
      .then(() => {
        response.json("Event location updated"); 
      })
      .catch((error: any) => {
        response.send("Error updating event");
    });
};

exports.getStats = async (request: any, response: any) => {
    await firestore
      .collection("event")
      .doc(request.params.event)
      .collection("stats")
      .doc(request.params.event)
      .get()
      .then(() => {
        response.json("Event stats retrieved"); 
      })
      .catch((error: any) => {
        response.send("Error getting event stats");
    });
};

