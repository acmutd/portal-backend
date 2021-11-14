import { model } from "mongoose";
import { IStickerDocument } from "./stickers.types";
import StickerSchema from "./stickers.schema";

export const StickerModel = model<IStickerDocument>("sticker", StickerSchema);
