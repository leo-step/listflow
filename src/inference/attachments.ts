import { ImageModel } from "../models/imageModel";
import { Attachment, SMTPEmail } from "../types/mailTypes";
import { getImageDescription } from "../utils/googleai";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.BUCKET_NAME || "";
const bucketRegion = process.env.BUCKET_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const MAX_ATTACHMENTS = 10;

export const processImageAttachments = async (data: SMTPEmail) => {
  const promises = data.attachments
    .filter((attachment) => attachment.contentType.startsWith("image/"))
    .slice(0, MAX_ATTACHMENTS)
    .map((attachment) => processImageAttachment(attachment));
  const results = await Promise.all(promises);
  return results;
};

const processImageAttachment = async (image: Attachment) => {
  let imageDoc = await ImageModel.findOne({
    checksum: image.checksum,
  });
  if (imageDoc) {
    return imageDoc;
  }

  let description = await getImageDescription(image);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: image.checksum,
    Body: image.content,
    ContentType: image.contentType,
  });
  await s3Client.send(command);

  imageDoc = new ImageModel({
    checksum: image.checksum,
    description: description,
  });
  const result = await imageDoc.save();

  return result;
};
