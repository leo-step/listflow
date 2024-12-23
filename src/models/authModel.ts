import { Schema, model } from "mongoose";

export enum AuthorizationType {
  SENDER = "sender",
  RECIPIENT = "recipient",
}

const APIKeySchema = new Schema({
  appName: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true }, // TODO: security
});

const AuthorizationSchema = new Schema({
  address: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(AuthorizationType),
    required: true,
  },
});

const APIKeyModel = model("APIKey", APIKeySchema);
const AuthorizationModel = model("Authorization", AuthorizationSchema);

export { APIKeyModel, AuthorizationModel };
