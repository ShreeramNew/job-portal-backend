const router = require("express").Router();
const CompanyDetailsModel = require("../../models/CompanyDetails");
const EmployerModel = require("../../models/EmployerModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//--------------------Used in onboarding of employer-----------------------
router.post("/", async (req, res) => {
   let cookie = req.cookies;

   if (cookie.authToken) {
      let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
      const DataToSave = {
         ...req.body,
         employerId: payload.uid,
      };
      try {
         await companyDetails.create(DataToSave);
         res.status(200).json({ msg: "Success!" });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Something went wrong" });
      }
   } else {
      res.status(401).json({ msg: "Unauthorized access!" });
   }
});

//---------------------Used to edit the company profile-----------------------
router.patch("/", async (req, res) => {
   let cookie = req.cookies;
   if (cookie.authToken) {
      let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
      if (payload.uid) {
         try {
            let response = await CompanyDetailsModel.findOneAndUpdate(
               { employerId: payload.uid },
               req.body,
               { new: true, runValidators: true }
            );
            res.status(200).json({ msg: "Saved!", response });
         } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Something went wrong" });
         }
      } else {
         res.status(500).json({ msg: "Unauthorized access!" });
      }
   } else {
      res.status(401).json({ msg: "Unauthorized access!" });
   }
});

//--------------------------Used to get the current profile details------------------
router.get("/", async (req, res) => {
   let empId = req.query.empId;
   console.log(empId);

   if (empId) {
      try {
         let response = await CompanyDetailsModel.findOne({ employerId: empId });
         let employerDeatilResoponse = await EmployerModel.findById(empId);
         console.log(employerDeatilResoponse.email);
         console.log(response);
         res.status(200).json({
            msg: "Success is good!",
            profile: { ...response._doc, email: employerDeatilResoponse.email },
         });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Something went wrong" });
      }
   } else {
      res.status(401).json({ msg: "Unauthorized access!" });
   }
});

module.exports = router;
