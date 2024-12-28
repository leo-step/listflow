import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const bucketName = process.env.BUCKET_NAME || "";
const bucketRegion = process.env.BUCKET_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

export const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
