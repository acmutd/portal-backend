import { Document, Model } from "mongoose";

export interface IResume {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  netid: string;
  role: string[];
  graduating: string;
  file_id: string;
}

export interface IResumeDocument extends IResume, Document {}
export interface IResumeModel extends Model<IResumeDocument> {}
