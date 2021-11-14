import { Document, Model } from "mongoose";

export interface Person {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

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

export interface IEventDocument extends IEvent, Document {
  addReserved: (this: IEventDocument, newPerson: Person) => Promise<void>;
  addAttended: (this: IEventDocument, newPerson: Person) => Promise<void>;
}
export type IEventModel = Model<IEventDocument>;
