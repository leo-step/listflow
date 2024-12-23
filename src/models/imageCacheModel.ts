import { Schema, model } from "mongoose";

const ImageCacheSchema = new Schema({
  checksum: { type: String, required: true },
  description: { type: String, required: true },
});

const ImageCacheModel = model("ImageCache", ImageCacheSchema);

export { ImageCacheModel };
