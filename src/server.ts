import { app, nodeMailin } from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const API_PORT = process.env.PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 587;

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

const initializeMongoDB = async () => {
  try {
    await mongoose.connect(getUri());
    console.log("MongoDB connected successfully");

    const collection = mongoose.connection.collection("emails");

    try {
      await collection.createIndexes([
        {
          key: { time: -1 },
          name: "time_idx",
        },
        {
          key: { subject: "text", text: "text" },
          name: "email_text_idx",
        },
        {
          key: { messageId: 1 },
          name: "messageId_1",
        },
      ]);
    } catch {
      console.log("Indexes already created");
    }

    try {
      await collection.createSearchIndexes([
        {
          definition: {
            fields: [
              {
                numDimensions: 256,
                path: "computed.embedding",
                similarity: "cosine",
                type: "vector",
              },
            ],
          },
          name: "embedding",
        },
        {
          definition: {
            mappings: {
              dynamic: false,
              fields: {
                "computed.parsedText": [
                  {
                    type: "string",
                  },
                ],
              },
            },
          },
          name: "parsedText",
        },
      ]);
    } catch {
      console.log("Search indexes already created");
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

initializeMongoDB();
