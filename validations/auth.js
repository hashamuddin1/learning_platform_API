const Joi = require("joi");

const userSignUpValidate = Joi.object({
  emailAddress: Joi.string().email().required().messages({
    "any.required": "Please Enter Your Email Address",
    "string.empty": "Please Enter Your Email Address",
  }),
  fullName: Joi.string().required().messages({
    "any.required": "Please Enter Your Full Name",
    "string.empty": "Please Enter Your Full Name",
  }),
  password: Joi.string().required().messages({
    "any.required": "Please Enter Your Password",
    "string.empty": "Please Enter Your Password",
  }),
  role: Joi.string().valid("Admin", "Student", "Teacher").required().messages({
    "any.required": "Please Enter Your Role",
    "string.empty": "Please Enter Your Role",
  }),
  profilePicture: Joi.string().allow(null).allow(""),
  education: Joi.string().allow(null).allow(""),
  subject: Joi.string().allow(null).allow(""),
  cvImage: Joi.string().allow(null).allow(""),
  bankAccount: Joi.string().allow(null).allow(""),
});

const userLoginValidate = Joi.object({
  emailAddress: Joi.string().email().required().messages({
    "any.required": "Please Enter Your Email Address",
    "string.empty": "Please Enter Your Email Address",
  }),
  password: Joi.string().required().messages({
    "any.required": "Please Enter Your Password",
    "string.empty": "Please Enter Your Password",
  }),
});

module.exports = {
  userSignUpValidate,
  userLoginValidate,
};
