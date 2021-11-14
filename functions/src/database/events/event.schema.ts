import { Schema } from "mongoose";
import { addAttended, addReserved } from "./event.methods";
import { IEventDocument, IEventModel } from "./event.types";

const EventSchema = new Schema<IEventDocument, IEventModel>({
  name: String,
  checkin_path: String,
  google_cal: String,
  sticker_id: String,
  reserved: [
    {
      user_id: String,
      first_name: String,
      last_name: String,
      email: String,
    },
  ],
  attended: [
    {
      user_id: String,
      first_name: String,
      last_name: String,
      email: String,
    },
  ],
});

EventSchema.methods.addReserved = addReserved;
EventSchema.methods.addAttended = addAttended;

export default EventSchema;
