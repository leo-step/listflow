import { app, nodeMailin } from "./app";

const API_PORT = process.env.API_PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 25;

app.listen(API_PORT, () => {
  console.log(`API server running on http://localhost:${API_PORT}`);
});

nodeMailin.start({
  port: SMTP_PORT,
});
