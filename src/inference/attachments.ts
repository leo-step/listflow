import { ImageCacheModel } from "../models/imageCacheModel";
import { Attachment, SMTPEmail } from "../types/mailTypes";
import { openai } from "../utils/openai";

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
  const imageCacheDoc = await ImageCacheModel.findOne({
    checksum: image.checksum,
  });
  if (imageCacheDoc) {
    return imageCacheDoc.description;
  }

  if (image.size > 10000000) {
    return "Image attachment was too big to process.";
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe what is in this image. If there is any text, make sure to transcribe it word for word.",
          },
          {
            type: "image_url",
            image_url: {
              // TODO: this image should be stored and be accessible through S3, store link in image cache
              url: `data:${image.contentType};base64,${image.content.toString(
                "base64"
              )}`,
            },
          },
        ],
      },
    ],
  });

  const description = response.choices[0].message.content;

  if (!description) {
    return "Image description could not be processed.";
  }

  const imageCache = new ImageCacheModel({
    checksum: image.checksum,
    description: description,
  });
  await imageCache.save();

  return description;
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
