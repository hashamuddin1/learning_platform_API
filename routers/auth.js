const express = require("express");
const authRouter = express.Router();
const multer = require("multer");
const upload = multer();

const { userSignUp } = require("../controllers/authController");

authRouter.post("/api/userSignUp",[upload.single("profilePicture")], userSignUp);

module.exports = authRouter;
