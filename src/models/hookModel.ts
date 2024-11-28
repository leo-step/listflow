import { Schema, model } from "mongoose";

export enum HTTPMethod {
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

const HookSchema = new Schema({
  appName: { type: String, required: true }, // add authorized domains to prevent arbitrary target
  filter: { type: Schema.Types.Mixed, required: true },
  target: { type: String, required: true },
  method: {
    type: String,
    required: true,
    enum: [...Object.values(HTTPMethod)],
  },
  payload: { type: Schema.Types.Mixed, required: true }, // how to include email into the payload?
});

const HookModel = model("Hook", HookSchema);

export { HookModel };
