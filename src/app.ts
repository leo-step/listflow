import express from "express";
import routes from "./routes";

const app = express();
const nodeMailin = require("node-mailin");

app.use(express.json());

app.use("/api", routes);

export { app, nodeMailin };
