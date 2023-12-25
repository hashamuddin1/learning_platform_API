const express = require("express");
const authRouter = express.Router();
const multer = require("multer");
const upload = multer();

const { userSignUp, userLogin } = require("../controllers/authController");

authRouter.post(
  "/api/userSignUp",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "cvImage", maxCount: 1 },
  ]),
  userSignUp
);

authRouter.post("/api/userLogin", userLogin);

module.exports = authRouter;
