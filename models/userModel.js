const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    emailAddress: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Teacher"],
      required: true,
    },
    education: {
      type: String,
      required: false,
      default: null,
    },
    subject: {
      type: String,
      required: false,
      default: null,
    },
    cvImage: {
      type: String,
      required: false,
      default: null,
    },
    accountId: {
      type: String,
      required: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const users = new mongoose.model("users", userSchema);

module.exports = { users };
