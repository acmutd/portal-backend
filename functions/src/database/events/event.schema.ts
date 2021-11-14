import { Schema } from "mongoose";

const EventSchema = new Schema({
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

export default EventSchema;
