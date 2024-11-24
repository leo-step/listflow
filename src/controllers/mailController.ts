import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";
import { getUnixTime } from "../utils/helpers";
import { getExpiryTime } from "../inference/expiry";
import { getEmailEmbedding } from "../inference/embedding";

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
