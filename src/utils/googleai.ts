import { GoogleGenerativeAI } from "@google/generative-ai";
import { Attachment } from "../types/mailTypes";

// needed because node 16
const fetch = require("node-fetch");

global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getImageDescription(
  image: Attachment,
  modelName: string = "gemini-1.5-flash"
) {
  const model = genAI.getGenerativeModel({ model: `models/${modelName}` });
  const result = await model.generateContent([
    {
      inlineData: {
        data: image.content.toString("base64"),
        mimeType: image.contentType,
      },
    },
    "Describe what is in this image. If there is any text, make sure to transcribe it word for word. Be concise.",
  ]);
  return collapseWhitespace(result.response.text());
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
