import { Schema } from "mongoose";

const StickerSchema = new Schema({
  event_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  asset_url: {
    type: String,
    required: true,
  },
});

export default StickerSchema;
