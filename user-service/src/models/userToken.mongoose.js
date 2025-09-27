const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  type: { type: String, enum: ["REFRESH", "ACCESS"], default: "REFRESH" },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

userTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserTokenModel = mongoose.model("UserToken", userTokenSchema);

module.exports = { UserTokenModel };
