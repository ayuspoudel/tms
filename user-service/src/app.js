import express from "express";
import { handler } from "./handlers/userHandler.js";

const app = express();
app.use(express.json());

app.use(async (req, res) => {
  const event = {
    httpMethod: req.method,
    path: req.path,
    body: JSON.stringify(req.body),
    headers: req.headers,
    queryStringParameters: req.query,
  };

  try {
    const result = await handler(event, {}, () => {});
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (err) {
    console.error("Local handler error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Local server running on http://localhost:${port}`);
});
