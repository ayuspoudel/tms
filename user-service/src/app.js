const express = require("express");
const authRoutes = require("./routes/auth.routes.js");
const userMgmtRoutes = require("./routes/usermgmt.routes.js");
const { errorHandler } = require("./middlewares/errorHandler.js");
const cors = require("cors")
function createApp() {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173", // allow frontend
      credentials: false,               // if you ever send cookies
    })
  );
  app.use(express.json());

  // routes
  app.use("/auth", authRoutes);
  app.use("/users", userMgmtRoutes);

  // error handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
