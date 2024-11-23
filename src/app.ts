import express from "express";
import routes from "./routes";
import { handleMessage } from "./controllers/mailController";

const app = express();
const nodeMailin = require("node-mailin");

app.use(express.json());

app.use("/api", routes);

nodeMailin.on("message", handleMessage);

export { app, nodeMailin };
