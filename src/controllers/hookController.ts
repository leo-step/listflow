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
    .countDocuments(filter); // handle mongo errors?
  // TODO: instead of count you should test in memory running
  // because thats what actually runs
  // TODO: header must include content type json, just put in here

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

export const updateHook = async (req: Request, res: Response) => {
  // const body = req.body;
  // const appName = req.appName;
  // const _id = body._id;
  // const updates = body.updates as ;
  // const result = await HookModel.updateOne(
  //   { appName, _id },
  //   { $set: { field: newValue } }
  // );
};

export const deleteHook = async (req: Request, res: Response) => {
  const body = req.body;
  const appName = req.appName;
  const _id = body._id;

  const result = await HookModel.deleteOne({
    appName,
    _id,
  });

  if (result.deletedCount === 0) {
    res.status(404).send("Hook not found");
  } else {
    res.status(200).send("Hook deleted successfully");
  }
};
