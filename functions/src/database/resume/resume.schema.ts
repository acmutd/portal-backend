import { Schema } from "mongoose";
import { addRole, removeRole } from "../resume/resume.methods";
import { setFileId, setGraduating } from "./resume.methods";
import { IResumeDocument, IResumeModel } from "./resume.types";

const ResumeSchema = new Schema<IResumeDocument, IResumeModel>({
  user_id: {
    type: String,
    required: true,
  },
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
  netid: {
    type: String,
    required: true,
  },
  role: [
    {
      type: String,
      required: true,
    },
  ],
  graduating: {
    type: String,
    required: true,
  },
  file_id: {
    type: String,
    required: true,
  },
});

ResumeSchema.methods.setGraduating = setGraduating;
ResumeSchema.methods.addRole = addRole;
ResumeSchema.methods.removeRole = removeRole;
ResumeSchema.methods.setFileId = setFileId;

export default ResumeSchema;
