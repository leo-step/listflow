import { Attachment, SMTPEmail } from "../types/mailTypes";

const MAX_ATTACHMENTS = 10;

export const getAttachmentDescriptions = async (data: SMTPEmail) => {
  const promises: Promise<string>[] = [];
  for (const attachment of data.attachments.slice(0, MAX_ATTACHMENTS)) {
    if (attachment.contentType.startsWith("image/")) {
      promises.push(processImageAttachment(attachment));
    }
  }
  const descriptions = await Promise.all(promises);
  return descriptions;
};

const processImageAttachment = async (image: Attachment) => {
  return ""; // TODO: process image
};

// attachments: [
//     {
//       type: 'attachment',
//       content: <Buffer ff d8 ff e1 2d 89 45 78 69 66 00 00 4d 4d 00 2a 00
//       release: null,
//       contentDisposition: 'inline',
//       filename: 'image0.jpeg',
//       headers: [Map],
//       checksum: '6e00c7e2a852e56397b3f97f23e2f09d',
//       size: 3490919
//     }
//   ],
