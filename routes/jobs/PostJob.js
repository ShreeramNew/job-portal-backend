const express = require("express");
const JobModel = require("../../models/JobsModel");
const CompanyDeatils = require("../../models/CompanyDetails");
const GetUid = require("../../middlewares/GetUid");
const ApplyModel = require("../../models/ApplyModel");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

//----------------------Post a new Job------------------------
router.post("/", GetUid, async (req, res) => {
   try {
      let response = await CompanyDeatils.findOne({ employerId: req.uid });
      const DataToSave = {
         ...req.body,
         employerId: req.uid,
         company: response.companyName,
      };
      //Save the data
      await JobModel.create(DataToSave);
      res.status(200).json({ msg: "Job Posted!" });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Something went wrong" });
   }
});

//---------------------Fetch highlight of all posted job--------------------------
router.get("/", GetUid, async (req, res) => {
   //Fetch the jobs
   let response = await JobModel.find({ employerId: { $eq: req.uid } }).lean();

   let ResponseToSend =await Promise.all(
      response.map(async (job) => {
         //-----------Find the number of applicants of that job---------
         let result = await ApplyModel.findOne({ jobId: job._id });
         let numberOfAppliacants = result ? result.applicants.length : 0;
         let savedApplicants = result ? result.savedApplicants.length : 0;

         let postedTimeStamp = new Date(job._id.getTimestamp());
         let postedDate = postedTimeStamp.toLocaleDateString();
         postedTimeStamp.setDate(postedTimeStamp.getDate() + 60);

         let newResult = {
            jobId: job._id,
            title: job.jobTitle,
            applicants: numberOfAppliacants,
            postedOn: postedDate,
            expiresOn: postedTimeStamp.toLocaleDateString(),
            savedApplicants
         };
         return newResult;
      })
   );
   res.status(200).json({ msg: "Succcess!", jobs: ResponseToSend });
});

module.exports = router;
