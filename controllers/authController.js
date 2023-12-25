const { users } = require("../models/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  userSignUpValidate,
  userLoginValidate,
} = require("../validations/auth");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const PROCESS = process.env;
const stripe = require("stripe")(PROCESS.STRIPE_SECRET_KEY);

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

    if (!req.files["profilePicture"]) {
      return res.status(400).send({
        success: false,
        message: "Please Upload Your Profile Picture",
      });
    }
    const profilePictureResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${req.files["profilePicture"][0].buffer.toString(
        "base64"
      )}`
    );

    let user;
    if (req.body.role === "Teacher") {
      if (!req.files["cvImage"]) {
        return res.status(400).send({
          success: false,
          message: "Please Upload Your CV",
        });
      }

      if (!req.body.bankAccount) {
        return res.status(400).send({
          success: false,
          message: "Please Enter Your Bank Account",
        });
      }

      if (!req.body.education) {
        return res.status(400).send({
          success: false,
          message: "Please Enter Your Education",
        });
      }

      if (!req.body.subject) {
        return res.status(400).send({
          success: false,
          message: "Please Enter Your Subject",
        });
      }
      const account = await stripe.accounts.create({
        type: "custom",
        country: "US",
        email: req.body.emailAddress,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: req.body.fullName,
          support_email: req.body.emailAddress,
        },
        business_type: "individual",
        individual: {
          verification: {
            additional_document: {
              front: "file_identity_document_success",
            },
            document: {
              front: "file_identity_document_success",
            },
          },
          email: req.body.emailAddress,
        },
        external_account: {
          account_number: req.body.bankAccount,
          object: "bank_account",
          country: "US",
          currency: "usd",
          routing_number: "110000000",
        },

        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.connection.remoteAddress,
        },
      });
      const cvImageResponse = await cloudinary.uploader.upload(
        `data:image/png;base64,${req.files["cvImage"][0].buffer.toString(
          "base64"
        )}`
      );

      user = new users({
        emailAddress: req.body.emailAddress,
        fullName: req.body.fullName,
        password: req.body.password,
        role: req.body.role,
        profilePicture: `${profilePictureResponse.url}`,
        cvImage: `${cvImageResponse.url}`,
        education: req.body.education,
        subject: req.body.subject,
        accountId: account.id,
      });
    }

    if (req.body.role === "Student" || req.body.role === "Admin") {
      user = new users({
        emailAddress: req.body.emailAddress,
        fullName: req.body.fullName,
        password: req.body.password,
        role: req.body.role,
        profilePicture: `${profilePictureResponse.url}`,
      });
    }

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

const userLogin = async (req, res) => {
  try {
    const { error } = userLoginValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }
    const checkUser = await users
      .findOne({
        emailAddress: req.body.emailAddress,
      })
      .select({ updatedAt: 0 });

    if (!checkUser) {
      return res.status(400).send({
        success: false,
        message: "Invalid Email Address",
      });
    }

    if (
      checkUser &&
      (await bcrypt.compare(req.body.password, checkUser.password))
    ) {
      const token = jwt.sign(
        { _id: checkUser._id, emailAddress: checkUser.emailAddress },
        process.env.TOKEN_KEY,
        {
          expiresIn: "30d",
        }
      );

      return res.status(200).send({
        success: true,
        message: "User Login Successfully",
        data: checkUser,
        token,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { userSignUp, userLogin };
