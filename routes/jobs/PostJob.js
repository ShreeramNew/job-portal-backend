const express = require("express");
const JobModel = require("../../models/JobsModel");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

router.post("/", async (req, res) => {
   let authToken = req.cookies.authToken;
   if (authToken) {
      //Take the uid from the authtoken
      let payload = jwt.verify(authToken, process.env.JWT_PRIVATE_SIGN);
      if (payload.uid) {
         //If uid is there, then prepare the data to save
         const DataToSave = {
            ...req.body,
            employerId: payload.uid,
         };
         try {
            //Save the data
            await JobModel.create(DataToSave);
            res.status(200).json({ msg: "Job Posted!" });
         } catch (error) {
            console.log(error);

            res.status(500).json({ msg: "Something went wrong" });
         }
      } else {
         res.status(400).json({ msg: "Unauthorized access!" });
      }
   } else {
      res.status(400).json({ msg: "Unauthorized access!" });
   }
});

router.get("/", async (req, res) => {
   let authToken = req.cookies.authToken;
   if (authToken) {
      //Take the uid from the authtoken
      let payload = jwt.verify(authToken, process.env.JWT_PRIVATE_SIGN);
      if (payload.uid) {
         try {
            //Fetch the jobs
            let response = await JobModel.find({ employerId: { $eq: payload.uid } }).lean();
            
            let ResponseToSend=response.map((job)=>{
                let postedTimeStamp=new Date(job._id.getTimestamp());
                let postedDate=postedTimeStamp.toLocaleDateString()
                postedTimeStamp.setDate(postedTimeStamp.getDate()+30);
                let newResult=  {
                    jobId:job._id,
                    title: job.jobTitle,
                    applicants: 30,
                    postedOn:postedDate ,
                    expiresOn:postedTimeStamp.toLocaleDateString(),
                 }
                return newResult
            })
            res.status(200).json({ msg: "Succcess!", jobs: ResponseToSend });
         } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Something went wrong" });
         }
      }
   } else {
      res.status(400).json({ msg: "unauthorized access!" });
   }
});

module.exports = router;
