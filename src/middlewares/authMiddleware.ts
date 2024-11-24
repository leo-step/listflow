import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (token !== "your-secret-token") {
    res.status(403).json({ message: "Invalid token" });
    return;
  }

  next();
};

export default authMiddleware;
