import { Request, Response } from "express";
import mongoose from "mongoose";
import { Document } from "mongodb";

const EMAILS_COLLECTION = "emails";
const DEFAULT_LIMIT = 100;

export const find = async (req: Request, res: Response) => {
  const body = req.body;
  const filter = body.filter as mongoose.mongo.Filter<Document>;
  const options = body.options as mongoose.mongo.FindOptions<Document>;

  ensureSafeOptions(options);

  const cursor = await mongoose.connection.db
    ?.collection(EMAILS_COLLECTION)
    .find(filter, options);

  if (!cursor) {
    res.status(503).send("Server database connection is not established");
    return;
  }

  const emails = await cursor.toArray();
  res.status(200).send(emails);
};

export const aggregate = async (req: Request, res: Response) => {
  const body = req.body;
  const pipeline = body.pipeline as Document[];
  const options = body.options as mongoose.mongo.FindOptions<Document>;

  ensureSafeOptions(options);

  const cursor = await mongoose.connection.db
    ?.collection(EMAILS_COLLECTION)
    .aggregate(pipeline, options);

  if (!cursor) {
    res.status(503).send("Server database connection is not established");
    return;
  }

  const emails = await cursor.toArray();
  res.status(200).send(emails);
};

const ensureSafeOptions = (options: mongoose.mongo.FindOptions<Document>) => {
  if (!options.limit) {
    options.limit = DEFAULT_LIMIT; // default limit so not out of memory
  }

  if (!options.projection) {
    options.projection = {};
  }

  options.projection._id = 0;
  options.projection.__v = 0;
};
