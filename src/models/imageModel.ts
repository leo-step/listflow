import { Schema, model } from "mongoose";

const ImageSchema = new Schema({
  checksum: { type: String, required: true },
  description: { type: String, required: true },
});

const ImageModel = model("Image", ImageSchema);

export { ImageModel };
