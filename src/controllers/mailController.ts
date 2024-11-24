import { EmailModel } from "../models/emailModel";
import { SMTPConnection, SMTPContent, SMTPEmail } from "../types/mailTypes";

export const handleMessage = async (
  connection: SMTPConnection,
  data: SMTPEmail,
  content: SMTPContent
) => {
  const email = new EmailModel({
    html: data.html,
    text: data.text,
    subject: data.subject,
    time: Math.floor(data.date.getTime() / 1000),
    messageId: data.messageId,
    from: data.envelopeFrom.address,
  });

  if (connection.remoteAddress !== "127.0.0.1") {
    await email.save();
  }
};
