import { Request, Response } from "express";
import mongoose from "mongoose";
import { Document } from "mongodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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

export const EMAILS_COLLECTION = "emails";
const DEFAULT_LIMIT = 50;

export const find = async (req: Request, res: Response) => {
  const body = req.body;
  const filter = body.filter as mongoose.mongo.Filter<Document>;
  const options = body.options as mongoose.mongo.FindOptions<Document>;
  const getImageUrls = body.images as boolean;

  if (!options.limit) {
    options.limit = DEFAULT_LIMIT; // default limit so not out of memory
  }

  const cursor = await mongoose.connection.db
    ?.collection(EMAILS_COLLECTION)
    .find(filter, options);

  if (!cursor) {
    res.status(503).send("Server database connection is not established");
    return;
  }

  const emails = await cursor.toArray();
  if (getImageUrls) {
    await convertImageChecksumsToPresignedURLs(emails);
  }

  res.status(200).send(emails);
};

export const aggregate = async (req: Request, res: Response) => {
  const body = req.body;
  const pipeline = body.pipeline as Document[];
  const options = body.options as mongoose.mongo.FindOptions<Document>;
  const getImageUrls = body.images as boolean;

  if (!options.limit) {
    options.limit = DEFAULT_LIMIT;
  }

  const cursor = await mongoose.connection.db
    ?.collection(EMAILS_COLLECTION)
    .aggregate(pipeline, options);

  if (!cursor) {
    res.status(503).send("Server database connection is not established");
    return;
  }

  const emails = await cursor.toArray();
  if (getImageUrls) {
    await convertImageChecksumsToPresignedURLs(emails);
  }

  res.status(200).send(emails);
};

const convertImageChecksumsToPresignedURLs = async (emails: any[]) => {
  await Promise.all(
    emails.map(async (email) => {
      const promises = email.images.map(async (imageChecksum: string) => {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: imageChecksum,
        });
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
      });
      email.images = await Promise.all(promises);
    })
  );
};
