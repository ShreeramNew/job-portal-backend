const JobsModel = require("../../models/JobsModel");
const CompanyDetailsModel = require("../../models/CompanyDetails");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

//----------------Fetch job detail using jobId----------
router.get("/", async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await JobsModel.findById(jobId);
      let CompanyDetailsResponse = await CompanyDetailsModel.findOne({
         employerId: response.employerId,
      });
      let postedTimeStamp = new Date(response._doc._id.getTimestamp());
      
      let result = {
         ...response._doc,
         company: CompanyDetailsResponse.companyName,
         postedOn: postedTimeStamp,
      };
      res.status(200).json({ msg: "Suceess!", jobDetails: result });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error!", error });
   }
});

//---------------Edit the Job----------------------------
router.patch("/", async (req, res) => {
   let cookies = req.cookies;
   let jobId = req.body.jobId;
   if (cookies.authToken) {
      let payload = jwt.verify(cookies.authToken, process.env.JWT_PRIVATE_SIGN);
      if (payload.uid) {
         try {
            let response = await JobsModel.findByIdAndUpdate(jobId, req.body, {
               new: true,
               runValidators: true,
            });
            res.status(200).json({ msg: "Saved Successfully!", response });
         } catch (error) {
            res.status(500).json({ msg: "Internal Server Error", error });
         }
      }
   } else {
      res.status(400).json({ msg: "Unauthorised access!" });
   }
});

module.exports = router;

