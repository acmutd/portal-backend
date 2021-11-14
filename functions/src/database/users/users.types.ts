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
  membership: boolean;

  membership_history: Array<{
    program: string;
    start_timestamp: Date;
    end_timestamp?: Date;
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

export interface IUserDocument extends IUser, Document {
  addProvider: (this: IUserDocument, provider: { provider: string; token: string }) => Promise<void>;
  endMostRecentMembership: (this: IUserDocument) => Promise<void>;
  addNewMembership: (this: IUserDocument, newMembership: { program: string; start_timestamp: Date }) => Promise<void>;
  addRole: (this: IUserDocument, newRole: string) => Promise<void>;
  removeRole: (this: IUserDocument, removedRole: string) => Promise<void>;
  addApplication: (this: IUserDocument, applicationName: string) => Promise<void>;
  attendEvent: (this: IUserDocument, newEvent: { event_id: string; name: string; timestamp: Date }) => Promise<void>;
  addSticker: (this: IUserDocument, newSticker: { sticker_id: string }) => Promise<void>;
}
export interface IUserModel extends Model<IUserDocument> {
  findByMembershipStatus: (this: IUserModel, membershipStatus: boolean) => Promise<IUserDocument[]>;
}
