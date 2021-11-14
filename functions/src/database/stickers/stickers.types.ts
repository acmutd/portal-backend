import { Document, Model } from "mongoose";

export interface ISticker {
  event_id: string;
  name: string;
  asset_url: string;
}

export interface IStickerDocument extends ISticker, Document {}
export interface IStickerModel extends Model<IStickerDocument> {}
