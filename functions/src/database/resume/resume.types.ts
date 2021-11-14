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

export interface IResumeDocument extends IResume, Document {
  setGraduating: (this: IResumeDocument, newGraduating: string) => Promise<void>;
  addRole: (this: IResumeDocument, newRole: string) => Promise<void>;
  removeRole: (this: IResumeDocument, removedRole: string) => Promise<void>;
  setFileId: (this: IResumeDocument, newFileId: string) => Promise<void>;
}
export interface IResumeModel extends Model<IResumeDocument> {}
