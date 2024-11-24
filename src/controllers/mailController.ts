import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";
import {
  createEmbedding,
  getOpenAIJsonResponse,
  userPrompt,
} from "../utils/openaiHelpers";

const DEFAULT_EXPIRY_DURATION = 604800; // one week in seconds

export const handleMessage = async (
  connection: SMTPConnection,
  data: SMTPEmail,
  content: SMTPContent
) => {
  // TODO:
  // compute tags
  // event extraction
  // handle duplicate emails
  // create indexes
  // handle image OCR
  // handle attachments

  const [embedding, expiry] = await Promise.all([
    getEmailEmbedding(data),
    getExpiryTime(data),
  ]);

  const email = new EmailModel({
    html: data.html,
    text: data.text,
    subject: data.subject,
    time: getUnixTime(data.date),
    messageId: data.messageId,
    from: data.envelopeFrom.address,
    computed: {
      expiry,
      embedding,
    },
  });

  await email.save();

  // if (connection.remoteAddress !== "127.0.0.1") {

  // }
};

const getUnixTime = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

const getEmailEmbedding = async (data: SMTPEmail) => {
  const text = `SUBJECT: ${data.subject}\nFrom: ${data.from}\nBody: ${data.text}`;
  return await createEmbedding(text);
};

const getExpiryTimePrompt = userPrompt((text: string, currentDate: string) => {
  return `${text}\n\nReturn a JSON with key 'time' and value in the format MM-DD-YYYY 
  where the date is the latest date found in this email. Consider all the dates! It's 
  important to find the latest date out of all of them, no matter the format. Today's 
  date is ${currentDate}, and you can use this fact to reason about any relative dates. 
  If there is no date referenced, return null for the time.`;
});

const getExpiryTime = async (email: SMTPEmail) => {
  type expiryTimeResponse = {
    time: string;
  };

  const emailUnixTime = getUnixTime(email.date);
  const date = new Date(emailUnixTime * 1000);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedDate = formatter.format(date);
  console.log(formattedDate);

  const response = await getOpenAIJsonResponse<expiryTimeResponse>([
    getExpiryTimePrompt(email.text, formattedDate),
  ]);

  if (!response || !response.time) {
    return emailUnixTime + DEFAULT_EXPIRY_DURATION;
  }

  const [month, day, year] = response.time.split("-");
  const expiryDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
  return getUnixTime(expiryDate);
};
