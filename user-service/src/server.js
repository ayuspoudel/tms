const { createApp } = require("./app.js");
const { connectDB } = require("./config/db.mongo.js");

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB(); // connect to Mongo first
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`User-service listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
