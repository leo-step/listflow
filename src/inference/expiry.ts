import { getOpenAIJsonResponse, userPrompt } from "../utils/openai";
import { SMTPEmail } from "../types/mailTypes";
import { getUnixTime } from "../utils/helpers";

const DEFAULT_EXPIRY_DURATION = 604800; // one week in seconds

const getExpiryTimePrompt = userPrompt((text: string, currentDate: string) => {
  return `${text}\n\nReturn a JSON with key 'time' and value in the format MM-DD-YYYY 
    where the date is the latest date found in this email. Consider all the dates! It's 
    important to find the latest date out of all of them, no matter the format. Today's 
    date is ${currentDate}, and you can use this fact to reason about any relative dates. 
    If there is no date referenced, return null for the time.`;
});

export const getExpiryTime = async (email: SMTPEmail, parsedText: string) => {
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

  const response = await getOpenAIJsonResponse<expiryTimeResponse>([
    getExpiryTimePrompt(parsedText, formattedDate),
  ]);

  if (!response || !response.time) {
    return emailUnixTime + DEFAULT_EXPIRY_DURATION;
  }

  const [month, day, year] = response.time.split("-");
  const expiryDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
  return getUnixTime(expiryDate);
};
