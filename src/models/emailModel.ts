import { Schema, model } from "mongoose";

const EmailSchema = new Schema({
  html: { type: String, required: true },
  text: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: Number, required: true }, // unix
  messageId: { type: String, required: true },
  from: { type: String, required: true }, // should include TO as well
  computed: {
    expiry: { type: Number, required: true },
    embedding: { type: [Number], required: true },
    tags: { type: [String], required: true },
  },
});

const EmailModel = model("Email", EmailSchema);

export { EmailModel };
