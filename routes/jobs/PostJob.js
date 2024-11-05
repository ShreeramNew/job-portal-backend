const express = require("express");
const JobModel = require("../../models/JobsModel");
const CompanyDeatils = require("../../models/CompanyDetails");
const GetUid = require("../../middlewares/GetUid");
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

   let ResponseToSend = response.map((job) => {
      let postedTimeStamp = new Date(job._id.getTimestamp());
      let postedDate = postedTimeStamp.toLocaleDateString();
      postedTimeStamp.setDate(postedTimeStamp.getDate() + 30);
      let newResult = {
         jobId: job._id,
         title: job.jobTitle,
         applicants: 30,
         postedOn: postedDate,
         expiresOn: postedTimeStamp.toLocaleDateString(),
      };
      return newResult;
   });
   res.status(200).json({ msg: "Succcess!", jobs: ResponseToSend });
});

module.exports = router;
