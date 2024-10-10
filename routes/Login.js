const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const EmployerModel = require("../models/EmployerModel");
const CompanyDetailsModel=require("../models/CompanyDetails");
const bcrypt = require("bcrypt");
const { validationResult, body } = require("express-validator");
const validationTestCases = [body("email").isEmail().withMessage("Invalid email!")];
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/", validationTestCases, async (req, res) => {
   //-------Perform some validation--------------
   let validationErrors = validationResult(req);
   if (validationErrors.length > 0) {
      return res.status(400).json({ msg: validationErrors[0].msg });
   }
   const { email, password, isEmployer } = req.body;
   if (!email || !password) {
      return res.status(400).json({ msg: "Email and Password must be provided" });
   }

   //----------------Fetch and see if user's/employer's email and password is correct----
   try {
      let response;
      if (isEmployer) {
         response = await EmployerModel.find({ email: { $eq: email } });
      } else {
         response = await UserModel.find({ email: { $eq: email } });
      }
      if (response.length > 0) {
         //Verify the password
         bcrypt.compare(password, response[0].password, async (err, verified) => {
            if (err) {
               console.log(err);
               return res.status(500).json({ msg: "Internal server error" });
            }
            if (verified) {
               //If verified, then send a jwt token
               let token = jwt.sign({ uid: response[0]._id }, process.env.JWT_PRIVATE_SIGN);
               res.cookie("authToken", token, {
                  httpOnly: true,
                  sameSite: "None",
                  secure: true,
                  path:"/"
               });
               //Check if onboarding is required or already done
               let isOnboardingRequired=await CheckOnboardingRequired(response[0]._id,isEmployer)
               console.log(isOnboardingRequired);
               
               res.status(200).json({ msg: "Login Success!",isOnboardingRequired });
            } else {
               res.status(400).json({ msg: "Invalid email and password!" });
            }
         });
      } else {
         res.status(400).json({ msg: "Invalid email!" });
      }
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal server error" });
   }
});


const CheckOnboardingRequired=async (id,isEmployer)=>{
   let result;
   if(isEmployer){
      result=await CompanyDetailsModel.find({employerId:{$eq:id}});
   }
   return result.length===0;
}
module.exports = router;
