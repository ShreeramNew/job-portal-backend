const express = require("express");
const router = express.Router();
const passwordHasher = require("../middlewares/HashPassword");
const UserModel = require("../models/UserModel");
const EmployerModel = require("../models/EmployerModel");
const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");
require("dotenv").config();

const validationTestCases = [body("email").isEmail().withMessage("Provide a valid email")];

router.post("/", validationTestCases, passwordHasher, async (req, res) => {
   const { email, password, isEmployer } = req.body;

   //Validate email
   let validationErrors = validationResult(req).errors;
   if (validationErrors.length > 0) {
      return res.status(400).json({ msg: validationErrors[0].msg });
   }

   //Insert user/employer into database
   try {
      let response;
      if (isEmployer) {
         response = await EmployerModel.create([{ email, password }]);
      } else {
         response = await UserModel.create([{ email, password }]);
      }
      //----------------create JWT token and send it as cookie------------
      let token = jwt.sign({ uid: response[0]._id }, process.env.JWT_PRIVATE_SIGN);
      res.cookie("authToken", token, {
         httpOnly: true,
         sameSite: "None",
         secure: true,
         path: "/",
      });
      res.status(200).json({ msg: "SignUp successfull", employerId: response[0]._id });
   } catch (error) {
      console.log(error);
      if (error.code === 11000) {
         res.status(400).json({ msg: "This email already exists" });
      } else {
         res.status(500).json({ msg: "Internal Server Error" });
      }
   }
});

module.exports = router;
