import mongoose from "mongoose";
import crypto from "crypto";
import readline from "readline";
import dotenv from "dotenv";
import { APIKeyModel } from "../src/models/authModel";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const generateAPIKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

const registerAPIKey = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI env var is required");
    }
    await mongoose.connect(uri);

    const appName = await prompt("App name: ");
    const contactEmail = await prompt("Contact email: ");

    const apiKey = generateAPIKey();
    console.log(`Generated API key: ${apiKey}`);

    const newAPIKey = new APIKeyModel({ appName, contactEmail, apiKey });
    await newAPIKey.save();

    console.log("API key registered successfully.");
  } catch (error) {
    console.error("Error registering API key:", error);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

registerAPIKey();
