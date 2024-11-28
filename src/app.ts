import express from "express";
import routes from "./routes";
import {
  //   handleAuthorizeUser,
  handleError,
  handleMessage,
  handleStartMessage,
  handleValidateRecipient,
  handleValidateSender,
} from "./controllers/mailController";
import authMiddleware from "./middlewares/authMiddleware";

const app = express();
const nodeMailin = require("node-mailin");

app.use(express.json());
app.use(authMiddleware);

app.use("/api", routes);

// nodeMailin.on("authorizeUser", handleAuthorizeUser);
nodeMailin.on("validateSender", handleValidateSender);
nodeMailin.on("validateRecipient", handleValidateRecipient);
nodeMailin.on("startMessage", handleStartMessage);
nodeMailin.on("message", handleMessage);
nodeMailin.on("error", handleError);

export { app, nodeMailin };
