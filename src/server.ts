import { app, nodeMailin } from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const API_PORT = process.env.API_PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 25;

app.listen(API_PORT, () => {
  console.log(`API server running on http://localhost:${API_PORT}`);
});

nodeMailin.start({
  port: SMTP_PORT,
});

const getUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI env var is required");
  }
  return uri;
};

mongoose
  .connect(getUri())
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
