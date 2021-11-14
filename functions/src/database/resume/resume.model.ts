import { model } from "mongoose";
import { IResumeDocument } from "./resume.types";
import ResumeSchema from "./resume.schema";

export const ResumeModel = model<IResumeDocument>("resume", ResumeSchema);
