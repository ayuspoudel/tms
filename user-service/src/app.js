const express = require("express");
const authRoutes = require("./routes/auth.routes.js");
const { errorHandler } = require("./middlewares/errorHandler.js");

function createApp() {
  const app = express();
  app.use(express.json());

  // routes
  app.use("/auth", authRoutes);

  // error handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
