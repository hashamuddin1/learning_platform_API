const { users } = require("../models/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userSignUpValidate } = require("../validations/auth");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userSignUp = async (req, res) => {
  try {
    const { error } = userSignUpValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    const checkEmail = await users.findOne({
      emailAddress: req.body.emailAddress,
    });

    if (checkEmail) {
      return res.status(400).send({
        success: false,
        message: "This Email Address is already Exist",
      });
    }

    if(!req.file){
      return res.status(400).send({
        success: false,
        message: "Please Upload Your Profile Picture",
      });
    }
    const response = await cloudinary.uploader.upload(
      `data:image/png;base64,${req.file.buffer.toString("base64")}`
    );
    const user = new users({
      emailAddress: req.body.emailAddress,
      fullName: req.body.fullName,
      password: req.body.password,
      role: req.body.role,
      profilePicture: `${response.url}`,
    });
    let saltPassword = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(user.password, saltPassword);
    user.password = encryptedPassword;

    await user.save();

    const token = jwt.sign(
      { _id: user._id, emailAddress: user.emailAddress },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).send({
      success: true,
      message: "User Registered Successfully",
      data: user,
      token,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { userSignUp };
