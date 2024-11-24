import { SMTPEmail } from "../types/mailTypes";
import { createEmbedding } from "../utils/openai";

export const getEmailEmbedding = async (data: SMTPEmail) => {
  const text = `SUBJECT: ${data.subject}\nFrom: ${data.from}\nBody: ${data.text}`;
  return await createEmbedding(text);
};
