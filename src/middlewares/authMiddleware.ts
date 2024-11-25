import { Request, Response, NextFunction } from "express";
import { APIKeyModel } from "../models/authModel";

declare global {
  namespace Express {
    interface Request {
      appName: string;
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader.split(" ")[1]; // make this into api key instead of bearer token
  const result = await APIKeyModel.findOne({ apiKey: token });
  if (!result) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }

  req.appName = result.appName;

  next();
};

export default authMiddleware;
