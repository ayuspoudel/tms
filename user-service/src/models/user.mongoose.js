const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // from domain
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, default: null },
    displayName: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN", "MANAGER"], default: "USER" },
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED"],
      default: "PENDING_VERIFICATION",
    },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };