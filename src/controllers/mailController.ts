import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";
import { getUnixTime } from "../utils/helpers";
import { getExpiryTime } from "../inference/expiry";
import { getTags } from "../inference/tagging";
import { HookModel } from "../models/hookModel";
import { createEmbedding } from "../utils/openai";
import { getAttachmentDescriptions } from "../inference/attachments";

const { query } = require("mongo-query");

const AUTHORIZED_SENDERS: string[] = ["sender@example.com"];
const AUTHORIZED_RECIPIENTS: string[] = [];
const WEBHOOK_BATCH_SIZE = 64;

class ErrorWithResponseCode extends Error {
  responseCode: number;

  constructor(message: string, responseCode: number) {
    super(message);
    this.responseCode = responseCode;

    Object.setPrototypeOf(this, ErrorWithResponseCode.prototype);
  }
}

// nodeMailin.on("authorizeUser", () => {});
// export const handleAuthorizeUser = async (
//   connection: SMTPConnection,
//   username: string,
//   password: string,
//   done: (error: Error, authorized: boolean) => void
// ) => {};

// nodeMailin.on("validateSender", () => {});
export const handleValidateSender = async (
  session: any,
  address: string,
  callback: (error?: Error) => void
) => {
  if (AUTHORIZED_SENDERS.length == 0 || AUTHORIZED_SENDERS.includes(address)) {
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
  if (
    AUTHORIZED_RECIPIENTS.length == 0 ||
    AUTHORIZED_RECIPIENTS.includes(address)
  ) {
    callback();
  } else {
    const err = new ErrorWithResponseCode("Failed validate recipient", 550);
    callback(err);
  }
};

export const handleStartMessage = (connection: SMTPConnection) => {
  console.log(connection);
};

const createParsedEmailText = (
  data: SMTPEmail,
  attachmentDescriptions: string[]
) => {
  return `SUBJECT: ${data.subject}\nFrom: ${data.from}\nBody: ${
    data.text
  }\nAttachments: ${attachmentDescriptions.join("\n")}`;
};

export const handleMessage = async (
  connection: SMTPConnection,
  data: SMTPEmail,
  content: SMTPContent
) => {
  // TODO:
  // event extraction
  // handle duplicate emails
  // create indexes
  // handle image OCR
  // handle attachments
  console.log(data);

  const attachmentDescriptions = await getAttachmentDescriptions(data);
  const parsedText = createParsedEmailText(data, attachmentDescriptions);

  const [embedding, expiry, tags] = await Promise.all([
    createEmbedding(parsedText),
    getExpiryTime(data), // should this use parsedText?
    getTags(data, parsedText),
  ]);

  const email = new EmailModel({
    html: data.html,
    text: data.text, // TODO: change email models to hold parsedText and other new fields
    subject: data.subject,
    time: getUnixTime(data.date),
    messageId: data.messageId,
    from: data.envelopeFrom.address,
    computed: {
      expiry,
      embedding,
      tags,
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
