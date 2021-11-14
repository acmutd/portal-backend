import { Document, Model } from "mongoose";

export interface IEvent {
  name: string;
  checkin_path: string;
  google_cal: string;
  sticker_id: string;
  reserved?: [
    {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
    }
  ];
  attended?: [
    {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
    }
  ];
}

export interface IEventDocument extends IEvent, Document {}
export type IEventModel = Model<IEventDocument>;
