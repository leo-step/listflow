import { Attachment, SMTPEmail } from "../types/mailTypes";

export const getAttachmentDescriptions = async (data: SMTPEmail) => {
  const promises: Promise<string>[] = [];
  for (const attachment of data.attachments) {
    if (attachment.contentType.startsWith("image/")) {
      promises.push(processImageAttachment(attachment));
    }
  }
  const descriptions = await Promise.all(promises);
  return descriptions;
};

const processImageAttachment = async (image: Attachment) => {
  return "";
};

// attachments: [
//     {
//       type: 'attachment',
//       content: <Buffer ff d8 ff e1 2d 89 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 0b 01 0f 00 02 00 00 00 06 00 00 00 92 01 10 00 02 00 00 00 1b 00 00 00 98 01 12 00 03 ... 3490869 more bytes>,
//       contentType: 'image/jpeg',
//       release: null,
//       contentDisposition: 'inline',
//       filename: 'image0.jpeg',
//       headers: [Map],
//       checksum: '6e00c7e2a852e56397b3f97f23e2f09d',
//       size: 3490919
//     }
//   ],
