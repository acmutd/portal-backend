import { Schema } from "mongoose";
import {
  addApplication,
  addNewMembership,
  addProvider,
  addRole,
  addSticker,
  attendEvent,
  endMostRecentMembership,
  removeRole,
} from "./users.methods";
import { findByMembershipStatus } from "./users.statics";
import { IUserDocument, IUserModel } from "./users.types";

const UserSchema = new Schema<IUserDocument, IUserModel>({
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
  school_id: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  membership: {
    type: Boolean,
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

UserSchema.statics.findByMembershipStatus = findByMembershipStatus;

UserSchema.methods.addProvider = addProvider;
UserSchema.methods.endMostRecentMembership = endMostRecentMembership;
UserSchema.methods.addNewMembership = addNewMembership;
UserSchema.methods.addRole = addRole;
UserSchema.methods.removeRole = removeRole;
UserSchema.methods.addApplication = addApplication;
UserSchema.methods.attendEvent = attendEvent;
UserSchema.methods.addSticker = addSticker;

export default UserSchema;
