import { Schema } from "mongoose";

const ResumeSchema = new Schema({
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

export default ResumeSchema;
