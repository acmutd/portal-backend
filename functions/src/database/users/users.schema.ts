import { Schema } from "mongoose";

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  providers: [
    {
      provider: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
  school_email: {
    type: String,
    required: true,
  },
  // NetID for UTD
  schoold_id: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  membership: {
    type: String,
    required: true,
  },
  membership_history: [
    {
      program: {
        type: String,
        required: true,
      },
      start_timestamp: {
        type: Date,
        required: true,
      },
      end_timestamp: {
        type: Date,
      },
    },
  ],
  role: [
    {
      type: String,
      required: true,
    },
  ],
  submitted_applications: [
    {
      application_id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        required: true,
      },
    },
  ],
  attended_events: [
    {
      event_id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        required: true,
      },
    },
  ],
  stickers: {
    sticker_id: {
      type: String,
      required: true,
    },
  },
  resume_id: {
    type: String,
    required: true,
  },
});

export default UserSchema;
