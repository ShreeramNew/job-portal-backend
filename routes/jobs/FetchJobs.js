const express = require("express");
const JobsModel = require("../../models/JobsModel");
const router = express.Router();

//-----------------------------------Get jobs based on search query--------------------------
router.get("/search", async (req, res) => {
   let searchString = req.query.q;
   try {
      let AllJobs = await JobsModel.find({ $text: { $search: searchString } });
      let resultToSend = AllJobs.map((job) => {
         return {
            ...job._doc,
            postedOn: job._id.getTimestamp(),
         };
      });
      res.status(200).json({ msg: "Success", jobs: resultToSend });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

//----------------------------------Get all Jobs----------------------------------------------
router.get("/allJobs", async (req, res) => {
   try {
      let response = await JobsModel.find({});
      let resultToSend = response.map((item) => {
         return {
            ...item._doc,
            postedOn: item._id.getTimestamp(),
         };
      });
      res.status(200).json({ msg: "Fecthed all jobs!", jobs: resultToSend });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

//-----------------------------------Get similar jobs--------------------------------------------
router.get("/similarJobs", async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let jobDetails = await JobsModel.findById(jobId);
      let allJobs = await JobsModel.find({ _id: { $ne: jobDetails._id } });

      let JobsSkillArray = jobDetails.skills.split(",");
      let similarJobs = allJobs.filter((job) => {
         let temp = 0;
         currentJobSkills = job.skills.split(",").slice(0, 4);
         currentJobSkills.forEach((skill) => {
            if (JobsSkillArray.includes(skill)) {
               temp = 1;
            }
         });
         return temp == 1;
      });

      let resultToSend = similarJobs.map((item) => {
         return {
            ...item._doc,
            postedOn: item._id.getTimestamp(),
         };
      });

      res.status(200).json({ msg: "Fecthed all jobs!", jobs: resultToSend });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

//-----------------------Get jobs based on filters-----------------------------
router.post("/", async (req, res) => {
   let filters = req.body.filters;
   let experience = filters.experience;
   let location = filters.location;
   let salary = filters.salary;
   if (salary.length > 0) {
      let SortedSalary = salary.sort((a, b) => a - b);
      let minSalary = SortedSalary[0];
      let maxSalary = SortedSalary[salary.length - 1];
      let response = await JobsModel.find({
         $and: [{ minSalary: { $gte: minSalary } }, { maxSalary: { $lte: maxSalary } }],
      });
      res.status(200).json({ msg: "Success!", response });
   }
   // res.status(200).json({ msg: "Success!", filters });
});
module.exports = router;
