import { app, nodeMailin } from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

nodeMailin.start({
  port: 25,
});
