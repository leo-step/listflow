import { Request, Response } from "express";

export const findAll = (req: Request, res: Response) => {
  res.status(200).send("execute find all query");
};
