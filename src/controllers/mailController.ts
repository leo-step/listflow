import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";
import { getUnixTime } from "../utils/helpers";
import { getExpiryTime } from "../inference/expiry";
import { getTags } from "../inference/tagging";
// import { HookModel } from "../models/hookModel";
import { createEmbedding } from "../utils/openai";
import { processImageAttachments } from "../inference/attachments";
import { AuthorizationModel, AuthorizationType } from "../models/authModel";
import { JSDOM } from "jsdom";

const { convert } = require("html-to-text");

// const { query } = require("mongo-query");

// const WEBHOOK_BATCH_SIZE = 64;

class ErrorWithResponseCode extends Error {
  responseCode: number;

  constructor(message: string, responseCode: number) {
    super(message);
    this.responseCode = responseCode;

    Object.setPrototypeOf(this, ErrorWithResponseCode.prototype);
  }
}

export const handleValidateSender = async (
  session: any,
  address: string,
  callback: (error?: Error) => void
) => {
  const [count, isAuthorized] = await Promise.all([
    AuthorizationModel.countDocuments(),
    AuthorizationModel.exists({
      address,
      type: AuthorizationType.SENDER,
    }),
  ]);
  if (count === 0 || isAuthorized) {
    callback();
  } else {
    const err = new ErrorWithResponseCode("Failed validate sender", 530);
    callback(err);
  }
};

// nodeMailin.on("validateRecipient", () => {});
export const handleValidateRecipient = async (
  session: any,
  address: string,
  callback: (error?: Error) => void
) => {
  const [count, isAuthorized] = await Promise.all([
    AuthorizationModel.countDocuments(),
    AuthorizationModel.exists({
      address,
      type: AuthorizationType.RECIPIENT,
    }),
  ]);
  if (count === 0 || isAuthorized) {
    callback();
  } else {
    const err = new ErrorWithResponseCode("Failed validate recipient", 550);
    callback(err);
  }
};

export const handleStartMessage = (connection: SMTPConnection) => {
  console.log(connection);
};

const createParsedEmailText = (data: SMTPEmail, attachments: string[]) => {
  return `SUBJECT: ${data.subject}\nFrom: ${
    data.envelopeFrom.address
  }\nBody: ${convert(data.html)}\n\nAttachments: ${attachments.join("\n\n")}`;
};

function extractLinksFromHTML(html: string): string[] {
  const dom = new JSDOM(html);
  const links: string[] = [];

  dom.window.document.querySelectorAll("a").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (href) {
      links.push(href);
    }
  });

  return links;
}

export const handleMessage = async (
  connection: SMTPConnection,
  data: SMTPEmail,
  content: SMTPContent
) => {
  // TODO:
  // event extraction
  // handle duplicate emails
  data.text = convert(data.html);

  const imageAttachments = await processImageAttachments(data);
  const imageChecksums = imageAttachments.map((doc) => doc.checksum);
  const imageDescriptions = imageAttachments.map((doc) => doc.description);

  const parsedText = createParsedEmailText(data, imageDescriptions);
  const links = extractLinksFromHTML(data.html);

  const [embedding, expiry, tags] = await Promise.all([
    createEmbedding(parsedText),
    getExpiryTime(data, parsedText),
    getTags(data, parsedText, links),
  ]);

  const email = new EmailModel({
    html: data.html,
    text: data.text,
    subject: data.subject,
    links: links,
    images: imageChecksums,
    time: getUnixTime(data.date),
    messageId: data.messageId,
    from: data.envelopeFrom.address,
    to: data.envelopeTo[0].address,
    computed: {
      expiry,
      embedding,
      tags,
      parsedText,
    },
  });

  const savedEmail = await email.save();

  // if (connection.remoteAddress !== "127.0.0.1") {

  // }

  // TODO: replace with AWS SQS and Lambda
  // ERROR: query is not a function

  // const totalHookCount = await HookModel.countDocuments();
  // const totalPages = Math.ceil(totalHookCount / WEBHOOK_BATCH_SIZE);

  // for (let pageNum = 0; pageNum < totalPages; pageNum++) {
  //   const skip = pageNum * WEBHOOK_BATCH_SIZE;
  //   const hooks = await HookModel.find().skip(skip).limit(WEBHOOK_BATCH_SIZE);
  //   const matchedHooks = hooks.filter((hook) => query(hook.filter, savedEmail));
  //   await Promise.all(
  //     matchedHooks.map(async (hook) => {
  //       return await fetch(hook.target, {
  //         method: hook.method,
  //         headers: hook.headers, // header must have Content-Type JSON
  //         body: JSON.stringify({
  //           payload: hook.payload,
  //           email: savedEmail,
  //         }),
  //       });
  //     })
  //   );
  // }
};

// nodeMailin.on("error", () => {});
export const handleError = (error: Error) => {
  console.log(error);
};
