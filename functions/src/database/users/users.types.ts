import { Document, Model } from "mongoose";

export interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;

  providers: Array<{
    provider: string;
    token: string;
  }>;
  school_email: string;
  school_id: string;
  school: string;
  membership: string;

  membership_history: Array<{
    program: string;
    start_timestamp: Date;
    end_timestamp: Date;
  }>;

  role: string[];

  submitted_applications: Array<{
    application_id: string;
    name: string;
    timestamp: Date;
  }>;

  attended_events: Array<{
    event_id: string;
    name: string;
    timestamp: Date;
  }>;

  stickers: Array<{ sticker_id: string }>;
  resume_id: string;
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}
