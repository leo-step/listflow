import { Schema, model } from "mongoose";

const APIKeySchema = new Schema({
  appName: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true }, // TODO: security
});

const APIKeyModel = model("APIKey", APIKeySchema);

export { APIKeyModel };
