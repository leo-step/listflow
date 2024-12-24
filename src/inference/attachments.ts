import { ImageModel } from "../models/imageModel";
import { Attachment, SMTPEmail } from "../types/mailTypes";
import { getImageDescription } from "../utils/googleai";

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
  let imageDoc = await ImageModel.findOne({
    checksum: image.checksum,
  });
  if (imageDoc) {
    return imageDoc.description;
  }

  if (image.size > 10000000) {
    return "Image attachment was too big to process.";
  }

  // TODO: this image should be stored and be accessible through S3, store link in image cache
  const description = await getImageDescription(image);

  imageDoc = new ImageModel({
    checksum: image.checksum,
    description: description,
  });
  await imageDoc.save();

  return description;
};
