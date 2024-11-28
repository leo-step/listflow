import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";
import { getUnixTime } from "../utils/helpers";
import { getExpiryTime } from "../inference/expiry";
import { getEmailEmbedding } from "../inference/embedding";
import { getTags } from "../inference/tagging";
import { HookModel } from "../models/hookModel";

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

  const [embedding, expiry, tags] = await Promise.all([
    getEmailEmbedding(data),
    getExpiryTime(data),
    getTags(data),
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
      tags,
    },
  });

  const savedEmail = await email.save();

  // if (connection.remoteAddress !== "127.0.0.1") {

  // }

  // TODO: replace with AWS SQS and Lambda
  const totalHookCount = await HookModel.countDocuments();
  const totalPages = Math.ceil(totalHookCount / WEBHOOK_BATCH_SIZE);

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const skip = pageNum * WEBHOOK_BATCH_SIZE;
    const hooks = await HookModel.find().skip(skip).limit(WEBHOOK_BATCH_SIZE);
  }
};

// nodeMailin.on("error", () => {});
export const handleError = (error: Error) => {
  console.log(error);
};
