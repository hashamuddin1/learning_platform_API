const express = require("express");
const authRouter = express.Router();

const { userSignUp } = require("../controllers/authController");

authRouter.post("/api/userSignUp", userSignUp);

module.exports = authRouter;
