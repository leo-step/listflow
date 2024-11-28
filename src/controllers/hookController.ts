import { Request, Response } from "express";
import mongoose from "mongoose";
import { Document } from "mongodb";
import { HookModel, HTTPMethod } from "../models/hookModel";
import { EMAILS_COLLECTION } from "./searchController";

// const HOOKS_COLLECTION = "hooks";

type HeadersDict = {
  [key: string]: string;
};

export const createHook = async (req: Request, res: Response) => {
  const body = req.body;
  const appName = req.appName;
  const filter = body.filter as mongoose.mongo.Filter<Document>;
  const target = body.target as string;
  const method = body.method as HTTPMethod;
  const headers = body.headers as HeadersDict;
  const payload = body.payload;

  const totalMatches = await mongoose.connection.db
    ?.collection(EMAILS_COLLECTION)
    .countDocuments(filter);

  if (!totalMatches) {
    res.status(503).send("Server database connection is not established");
    return;
  }

  const hook = new HookModel({
    appName,
    filter,
    target,
    method,
    headers,
    payload,
  });
  const savedHook = await hook.save();

  res.status(200).send({
    _id: savedHook._id,
  });
};
