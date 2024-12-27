import { ImageModel } from "../models/imageModel";
import { Attachment, SMTPEmail } from "../types/mailTypes";
import { getImageDescription } from "../utils/googleai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const MAX_ATTACHMENTS = 10;

const bucketName = process.env.BUCKET_NAME || "";
const bucketRegion = process.env.BUCKET_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

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

  const description = await getImageDescription(image);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: image.checksum,
    Body: image.content,
    ContentType: image.contentType,
  });
  await s3.send(command);

  imageDoc = new ImageModel({
    checksum: image.checksum,
    description: description,
  });
  await imageDoc.save();

  return description;
};
